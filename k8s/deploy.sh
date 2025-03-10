#!/bin/bash

# Script to deploy components separately to EKS
set -e

# Generate Kubernetes YAML files from templates
echo "Generating Kubernetes YAML files from templates..."
cd ..
./apply-secrets.sh
cd k8s

# Deploy ZooKeeper first (needed for Kafka)
echo "Deploying ZooKeeper..."
kubectl apply -f 02-zookeeper.yaml

# Deploy namespace and config first
echo "Deploying namespace and config..."
kubectl apply -f 01-namespace-config.yaml

# Deploy Kafka services
echo "Deploying Kafka services..."
kubectl apply -f 02-kafka.yaml

# Deploy backend
echo "Deploying backend..."
kubectl apply -f 03-backend.yaml

# Deploy frontend
echo "Deploying frontend..."
kubectl apply -f 04-frontend.yaml

# Optional: Deploy ingress if using AWS Load Balancer Controller
echo "Deploying ingress..."
kubectl apply -f 05-ingress.yaml || echo "Ingress deployment failed. You may need to install AWS Load Balancer Controller."

# Get the backend service endpoint
echo "Waiting for backend service to get an external IP..."
sleep 10
BACKEND_SERVICE_IP=$(kubectl get svc backend -n thomchat-app -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Update the ConfigMap to use the domain name with secure WebSockets
echo "Using domain name for WebSocket connections"
kubectl patch configmap app-config -n thomchat-app --type merge -p "{\"data\":{\"VITE_SOCKET_URL\":\"wss://thomchat-backend.patatoa.xyz:443\"}}"

# Restart the frontend to pick up the new configuration
echo "Restarting frontend deployment to pick up new config..."
kubectl rollout restart deployment frontend -n thomchat-app

echo "Deployment complete! Getting service endpoints..."
echo "-------------------------------------------"
echo "Backend endpoint:"
kubectl get svc backend -n thomchat-app
echo "-------------------------------------------"
echo "Frontend endpoint:"
kubectl get svc frontend -n thomchat-app
echo "-------------------------------------------"