package main

import (
	"flag"
	"os"

	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"k8s.io/apimachinery/pkg/runtime"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/healthz"
	metricsserver "sigs.k8s.io/controller-runtime/pkg/metrics/server"

	dnsv1alpha1 "github.com/gregorkurth/test-dns/operator/api/v1alpha1"
	"github.com/gregorkurth/test-dns/operator/controllers"
)

var scheme = runtime.NewScheme()

func init() {
	utilruntime.Must(clientgoscheme.AddToScheme(scheme))
	utilruntime.Must(dnsv1alpha1.AddToScheme(scheme))
}

func main() {
	var metricsAddr string
	var probeAddr string
	var leaderElection bool

	flag.StringVar(&metricsAddr, "metrics-bind-address", ":8080", "Metrics endpoint address.")
	flag.StringVar(&probeAddr, "health-probe-bind-address", ":8081", "Health probe address.")
	flag.BoolVar(&leaderElection, "leader-elect", false, "Enable leader election.")
	flag.Parse()

	ctrl.SetLogger(ctrl.Log.WithName("dns-operator"))

	manager, err := ctrl.NewManager(ctrl.GetConfigOrDie(), ctrl.Options{
		Scheme:                 scheme,
		Metrics:                metricsserver.Options{BindAddress: metricsAddr},
		HealthProbeBindAddress: probeAddr,
		LeaderElection:         leaderElection,
		LeaderElectionID:       "dns-configuration-operator.dns.fmn.mil",
	})
	if err != nil {
		os.Exit(1)
	}

	reconciler := &controllers.DNSConfigurationReconciler{
		Client: manager.GetClient(),
		Scheme: manager.GetScheme(),
	}
	if err := reconciler.SetupWithManager(manager); err != nil {
		os.Exit(1)
	}

	if err := manager.AddHealthzCheck("healthz", healthz.Ping); err != nil {
		os.Exit(1)
	}
	if err := manager.AddReadyzCheck("readyz", healthz.Ping); err != nil {
		os.Exit(1)
	}

	if err := manager.Start(ctrl.SetupSignalHandler()); err != nil {
		os.Exit(1)
	}
}
