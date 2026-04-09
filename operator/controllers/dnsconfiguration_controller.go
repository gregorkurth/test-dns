package controllers

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"time"

	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"

	dnsv1alpha1 "github.com/gregorkurth/test-dns/operator/api/v1alpha1"
)

const dnsConfigurationFinalizer = "dns.fmn.mil/finalizer"

// DNSConfigurationReconciler is a skeleton reconciler for OBJ-13.
// It is intentionally explicit about what is implemented now and what remains
// a runtime integration step (API sync, Git fetch, durable history backend).
type DNSConfigurationReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=dns.fmn.mil,resources=dnsconfigurations,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=dns.fmn.mil,resources=dnsconfigurations/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=dns.fmn.mil,resources=dnsconfigurations/finalizers,verbs=update
// +kubebuilder:rbac:groups="",resources=events,verbs=create;patch

func (r *DNSConfigurationReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	var resource dnsv1alpha1.DNSConfiguration
	if err := r.Get(ctx, req.NamespacedName, &resource); err != nil {
		if apierrors.IsNotFound(err) {
			return ctrl.Result{}, nil
		}
		return ctrl.Result{}, err
	}

	if resource.DeletionTimestamp != nil {
		return r.reconcileDelete(ctx, &resource)
	}

	if !containsString(resource.Finalizers, dnsConfigurationFinalizer) {
		resource.Finalizers = append(resource.Finalizers, dnsConfigurationFinalizer)
		if err := r.Update(ctx, &resource); err != nil {
			return ctrl.Result{}, err
		}
	}

	plan, err := r.buildPlan(&resource)
	if err != nil {
		return r.failStatus(ctx, &resource, "PlanBuildFailed", err)
	}

	if resource.Status.LastAppliedHash == plan.DesiredHash &&
		resource.Status.LastAppliedRevision == plan.TargetRevision &&
		resource.Status.ObservedGeneration == resource.Generation {
		resource.Status.Phase = dnsv1alpha1.PhaseApplied
		resource.Status.Message = "No changes detected. Desired state already applied."
		resource.Status.LastUpdated = dnsv1alpha1.Now()
		if err := r.Status().Update(ctx, &resource); err != nil {
			return ctrl.Result{}, err
		}
		return ctrl.Result{}, nil
	}

	if err := r.syncToDNSAPI(ctx, plan); err != nil {
		return r.failStatus(ctx, &resource, "DeliveryFailed", err)
	}

	resource.Status.Phase = dnsv1alpha1.PhaseApplied
	resource.Status.Message = fmt.Sprintf("Applied revision %s to %s.", plan.TargetRevision, plan.ZoneName)
	resource.Status.LastUpdated = dnsv1alpha1.Now()
	resource.Status.ObservedGeneration = resource.Generation
	resource.Status.LastAppliedRevision = plan.TargetRevision
	resource.Status.LastAttemptedRevision = plan.TargetRevision
	resource.Status.LastAppliedHash = plan.DesiredHash
	resource.Status.History = appendHistory(resource.Status.History, dnsv1alpha1.ChangeHistoryEntry{
		Revision:    plan.TargetRevision,
		Action:      plan.Action,
		Outcome:     "Applied",
		Message:     resource.Status.Message,
		Timestamp:   dnsv1alpha1.Now(),
		TriggeredBy: plan.TriggeredBy,
	})

	if err := r.Status().Update(ctx, &resource); err != nil {
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

func (r *DNSConfigurationReconciler) reconcileDelete(ctx context.Context, resource *dnsv1alpha1.DNSConfiguration) (ctrl.Result, error) {
	if !containsString(resource.Finalizers, dnsConfigurationFinalizer) {
		return ctrl.Result{}, nil
	}

	// TODO(OBJ-13): Revoke managed config from OBJ-3 target and persist deletion event.
	resource.Finalizers = removeString(resource.Finalizers, dnsConfigurationFinalizer)
	if err := r.Update(ctx, resource); err != nil {
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

func (r *DNSConfigurationReconciler) failStatus(
	ctx context.Context,
	resource *dnsv1alpha1.DNSConfiguration,
	action string,
	cause error,
) (ctrl.Result, error) {
	resource.Status.Phase = dnsv1alpha1.PhaseError
	resource.Status.Message = cause.Error()
	resource.Status.LastUpdated = dnsv1alpha1.Now()
	resource.Status.LastAttemptedRevision = resolveTargetRevision(resource)
	resource.Status.History = appendHistory(resource.Status.History, dnsv1alpha1.ChangeHistoryEntry{
		Revision:    resource.Status.LastAttemptedRevision,
		Action:      action,
		Outcome:     "Error",
		Message:     cause.Error(),
		Timestamp:   dnsv1alpha1.Now(),
		TriggeredBy: defaultTriggeredBy(resource),
	})

	statusErr := r.Status().Update(ctx, resource)
	if statusErr != nil {
		return ctrl.Result{}, statusErr
	}

	// Error path remains controlled: no crash loop, delayed retry.
	return ctrl.Result{RequeueAfter: 30 * time.Second}, nil
}

func (r *DNSConfigurationReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&dnsv1alpha1.DNSConfiguration{}).
		Complete(r)
}

type reconcilePlan struct {
	ZoneName       string
	TargetRevision string
	DesiredHash    string
	Action         string
	TriggeredBy    string
}

func (r *DNSConfigurationReconciler) buildPlan(resource *dnsv1alpha1.DNSConfiguration) (*reconcilePlan, error) {
	if resource.Spec.ZoneName == "" {
		return nil, fmt.Errorf("spec.zoneName must be set")
	}

	payload, err := json.Marshal(resource.Spec)
	if err != nil {
		return nil, fmt.Errorf("marshal spec: %w", err)
	}

	return &reconcilePlan{
		ZoneName:       resource.Spec.ZoneName,
		TargetRevision: resolveTargetRevision(resource),
		DesiredHash:    fmt.Sprintf("%x", sha256.Sum256(payload)),
		Action:         resolveAction(resource),
		TriggeredBy:    defaultTriggeredBy(resource),
	}, nil
}

func (r *DNSConfigurationReconciler) syncToDNSAPI(_ context.Context, _ *reconcilePlan) error {
	// TODO(OBJ-13): Implement secured delivery to OBJ-3 API.
	// Current scope is a real controller skeleton with explicit integration seam.
	return nil
}

func resolveTargetRevision(resource *dnsv1alpha1.DNSConfiguration) string {
	if resource.Spec.Rollback != nil && resource.Spec.Rollback.TargetRevision != "" {
		return resource.Spec.Rollback.TargetRevision
	}
	if resource.Spec.Baseline.Revision != "" {
		return resource.Spec.Baseline.Revision
	}
	return "working-copy"
}

func resolveAction(resource *dnsv1alpha1.DNSConfiguration) string {
	if resource.Spec.Rollback != nil && resource.Spec.Rollback.TargetRevision != "" {
		return "Rollback"
	}
	return "Apply"
}

func defaultTriggeredBy(resource *dnsv1alpha1.DNSConfiguration) string {
	if value := resource.Annotations["dns.fmn.mil/triggered-by"]; value != "" {
		return value
	}
	return "operator"
}

func appendHistory(
	history []dnsv1alpha1.ChangeHistoryEntry,
	entry dnsv1alpha1.ChangeHistoryEntry,
) []dnsv1alpha1.ChangeHistoryEntry {
	history = append(history, entry)
	if len(history) <= 10 {
		return history
	}
	return history[len(history)-10:]
}

func containsString(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}

func removeString(values []string, target string) []string {
	filtered := make([]string, 0, len(values))
	for _, value := range values {
		if value != target {
			filtered = append(filtered, value)
		}
	}
	return filtered
}
