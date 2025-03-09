# Kubernetes Deployment for Thomchat App

This directory contains Kubernetes manifests for deploying the application to Amazon EKS.

## Files

- `01-namespace-config.yaml`: Creates the namespace and ConfigMap
- `02-kafka.yaml`: Deploys Kafka StatefulSet and services
- `03-backend.yaml`: Deploys the backend service with Thomchat support
- `04-frontend.yaml`: Deploys the frontend service
- `deploy.sh`: Helper script for deployment

## Deployment Steps

### 1. Manual Deployment

To deploy the components separately:

```bash
# Change to the k8s directory
cd k8s

# Deploy namespace and config first
kubectl apply -f 01-namespace-config.yaml

# Deploy Kafka
kubectl apply -f 02-kafka.yaml

# Deploy backend
kubectl apply -f 03-backend.yaml

# Get the backend service endpoint
BACKEND_SERVICE_IP=$(kubectl get svc backend -n thomchat-app -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Update the ConfigMap with the backend service IP
kubectl patch configmap app-config -n thomchat-app --type merge -p "{\"data\":{\"VITE_SOCKET_URL\":\"ws://$BACKEND_SERVICE_IP:8000\"}}"

# Deploy frontend
kubectl apply -f 04-frontend.yaml
```

### 2. Using the Deployment Script

```bash
# Update the REGISTRY variable in the script with your container registry URL
vim deploy.sh

# Run the script
./deploy.sh
```

## Getting Public Endpoints

After deployment, you can get the public endpoints for your services:

```bash
kubectl get svc -n thomchat-app
```

The LoadBalancer services will have AWS-assigned hostnames in the EXTERNAL-IP column.

## Notes

- The backend service uses an AWS Network Load Balancer (NLB) with sticky sessions for Thomchat support
- Both frontend and backend use LoadBalancer services to get public endpoints
- The ConfigMap must be updated with the backend endpoint for the frontend to connect properly