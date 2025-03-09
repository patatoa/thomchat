#!/bin/bash
# Script to apply secrets from .k8s-secrets/secrets.env to template files

# Check if the secrets file exists
if [ ! -f ./.k8s-secrets/secrets.env ]; then
  echo "Error: Secrets file not found at ./.k8s-secrets/secrets.env"
  exit 1
fi

# Source the secrets file
source ./.k8s-secrets/secrets.env

# Process YAML templates
for template_file in k8s/*.yaml.template; do
  output_file="${template_file%.template}"
  cp "$template_file" "$output_file"
  
  # Replace all variables
  sed -i '' "s|\${DOMAIN_NAME}|$DOMAIN_NAME|g" "$output_file"
  sed -i '' "s|\${AWS_ACCOUNT_ID}|$AWS_ACCOUNT_ID|g" "$output_file"
  sed -i '' "s|\${AWS_REGION_ECR}|$AWS_REGION_ECR|g" "$output_file"
  sed -i '' "s|\${AWS_REGION_ACM}|$AWS_REGION_ACM|g" "$output_file"
  sed -i '' "s|\${ECR_URL}|$ECR_URL|g" "$output_file"
  sed -i '' "s|\${ACM_CERTIFICATE_ARN}|$ACM_CERTIFICATE_ARN|g" "$output_file"
  
  echo "Processed $template_file → $output_file"
done

# Process shell script templates
for template_file in k8s/*.sh.template; do
  output_file="${template_file%.template}"
  cp "$template_file" "$output_file"
  
  # Replace all variables
  sed -i '' "s|\${DOMAIN_NAME}|$DOMAIN_NAME|g" "$output_file"
  sed -i '' "s|\${AWS_ACCOUNT_ID}|$AWS_ACCOUNT_ID|g" "$output_file"
  sed -i '' "s|\${AWS_REGION_ECR}|$AWS_REGION_ECR|g" "$output_file"
  sed -i '' "s|\${AWS_REGION_ACM}|$AWS_REGION_ACM|g" "$output_file"
  sed -i '' "s|\${ECR_URL}|$ECR_URL|g" "$output_file"
  sed -i '' "s|\${ACM_CERTIFICATE_ARN}|$ACM_CERTIFICATE_ARN|g" "$output_file"
  
  # Make the script executable
  chmod +x "$output_file"
  
  echo "Processed $template_file → $output_file"
done

echo "All template files processed. You can now apply them with kubectl."