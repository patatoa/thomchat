# Thomchat Application

A chat application built with WebSockets, Kafka, and Kubernetes.

## Directory Structure

- `backend/`: Deno WebSocket server that connects to Kafka
- `frontend/`: React frontend application
- `k8s/`: Kubernetes configuration templates
- `.k8s-secrets/`: Contains secrets needed for deployment (not committed to git)

## Setup & Deployment

### 1. Set up Secrets

Create a copy of the sample secrets file:

```bash
cp .k8s-secrets/secrets.env.sample .k8s-secrets/secrets.env
```

Edit `.k8s-secrets/secrets.env` with your actual values:

```
# Domain names
DOMAIN_NAME=your-domain.example.com

# AWS Account ID
AWS_ACCOUNT_ID=123456789012

# AWS Region 
AWS_REGION_ECR=us-east-2
AWS_REGION_ACM=us-east-1

# AWS ECR URLs
ECR_URL=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION_ECR}.amazonaws.com

# AWS ACM Certificate ARN
ACM_CERTIFICATE_ARN=arn:aws:acm:${AWS_REGION_ACM}:${AWS_ACCOUNT_ID}:certificate/your-certificate-id
```

### 2. Generate Kubernetes YAML Files

Run:

```bash
./apply-secrets.sh
```

This will create the actual Kubernetes YAML files from the templates, replacing placeholders with your actual secrets.

### 3. Deploy to Kubernetes

```bash
# Deploy ZooKeeper first (required for Kafka)
kubectl apply -f k8s/02-zookeeper.yaml

# Deploy everything else
kubectl apply -f k8s/01-namespace-config.yaml
kubectl apply -f k8s/02-kafka.yaml
kubectl apply -f k8s/03-backend.yaml
kubectl apply -f k8s/04-frontend.yaml

# Optional: Deploy ingress if using AWS Load Balancer Controller
kubectl apply -f k8s/05-ingress.yaml
```

## Security Note

The actual Kubernetes YAML files are not committed to git as they contain sensitive information. Only the templates are committed. The `.k8s-secrets/` directory is in `.gitignore` to prevent accidentally committing secrets.

## Local Development

For local development, see the README files in the `frontend/` and `backend/` directories.