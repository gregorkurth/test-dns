package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// DNSConfigurationPhase describes the latest operator outcome.
type DNSConfigurationPhase string

const (
	PhasePending DNSConfigurationPhase = "Pending"
	PhaseApplied DNSConfigurationPhase = "Applied"
	PhaseError   DNSConfigurationPhase = "Error"
)

type BaselineSource struct {
	Repository string `json:"repository,omitempty"`
	Revision   string `json:"revision,omitempty"`
	Path       string `json:"path,omitempty"`
}

type DeliveryTarget struct {
	APIBaseURL       string `json:"apiBaseUrl,omitempty"`
	AuthSecretRef    string `json:"authSecretRef,omitempty"`
	ConfigurationSet string `json:"configurationSet,omitempty"`
}

type RollbackSpec struct {
	TargetRevision string `json:"targetRevision,omitempty"`
	Reason         string `json:"reason,omitempty"`
	RequestedBy    string `json:"requestedBy,omitempty"`
}

type MCPIntegrationSpec struct {
	Enabled      bool   `json:"enabled,omitempty"`
	PolicyRef    string `json:"policyRef,omitempty"`
	ServiceLabel string `json:"serviceLabel,omitempty"`
}

type DesiredRecord struct {
	Name  string `json:"name"`
	Type  string `json:"type"`
	Value string `json:"value"`
	TTL   int32  `json:"ttl,omitempty"`
}

// DNSConfigurationSpec holds the desired DNS state and governance references.
type DNSConfigurationSpec struct {
	ZoneName      string             `json:"zoneName"`
	Baseline      BaselineSource     `json:"baseline,omitempty"`
	DesiredRecords []DesiredRecord   `json:"desiredRecords,omitempty"`
	Delivery      DeliveryTarget     `json:"delivery,omitempty"`
	Rollback      *RollbackSpec      `json:"rollback,omitempty"`
	MCPIntegration MCPIntegrationSpec `json:"mcpIntegration,omitempty"`
}

type ChangeHistoryEntry struct {
	Revision   string      `json:"revision,omitempty"`
	Action     string      `json:"action,omitempty"`
	Outcome    string      `json:"outcome,omitempty"`
	Message    string      `json:"message,omitempty"`
	Timestamp  metav1.Time `json:"timestamp,omitempty"`
	TriggeredBy string     `json:"triggeredBy,omitempty"`
}

// DNSConfigurationStatus captures operator progress and audit hints.
type DNSConfigurationStatus struct {
	Phase                 DNSConfigurationPhase `json:"phase,omitempty"`
	Message               string                `json:"message,omitempty"`
	LastUpdated           metav1.Time           `json:"lastUpdated,omitempty"`
	ObservedGeneration    int64                 `json:"observedGeneration,omitempty"`
	LastAppliedRevision   string                `json:"lastAppliedRevision,omitempty"`
	LastAttemptedRevision string                `json:"lastAttemptedRevision,omitempty"`
	LastAppliedHash       string                `json:"lastAppliedHash,omitempty"`
	History               []ChangeHistoryEntry  `json:"history,omitempty"`
}

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status
// +kubebuilder:resource:scope=Namespaced,shortName=dnscfg
// +kubebuilder:printcolumn:name="Phase",type=string,JSONPath=`.status.phase`
// +kubebuilder:printcolumn:name="Revision",type=string,JSONPath=`.status.lastAppliedRevision`
// +kubebuilder:printcolumn:name="Updated",type=string,JSONPath=`.status.lastUpdated`

// DNSConfiguration declares the desired DNS configuration for the operator.
type DNSConfiguration struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   DNSConfigurationSpec   `json:"spec,omitempty"`
	Status DNSConfigurationStatus `json:"status,omitempty"`
}

// +kubebuilder:object:root=true

// DNSConfigurationList contains a list of DNSConfiguration.
type DNSConfigurationList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []DNSConfiguration `json:"items"`
}

func init() {
	SchemeBuilder.Register(&DNSConfiguration{}, &DNSConfigurationList{})
}
