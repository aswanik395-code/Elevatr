# Deploying Elevatr to AWS App Runner

This app is packaged as a **single Docker image** (frontend built as static
files, served by the FastAPI backend). App Runner runs one container and
gives you one public HTTPS URL — a good match for that.

## 0. Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- An AWS account
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured:
  ```bash
  aws configure
  # paste your Access Key ID, Secret Access Key, a region (e.g. us-east-1), output format (json)
  ```

## 1. Build the image locally (sanity check before pushing)

From the project root (where `Dockerfile` lives):
```bash
docker build -t elevatr .
docker run -p 8000:8000 --env-file backend/.env elevatr
```
Visit `http://localhost:8000` — you should see the full app (frontend +
working API) from a single container. Confirm this works before deploying.

## 2. Push the image to Amazon ECR (Elastic Container Registry)

```bash
# Set these once
export AWS_REGION=us-east-1        # or your preferred region
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create a repository (one-time)
aws ecr create-repository --repository-name elevatr --region $AWS_REGION

# Authenticate Docker to ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Tag and push
docker tag elevatr:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/elevatr:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/elevatr:latest
```

## 3. Create the App Runner service

**Via the AWS Console** (easiest for a one-off deploy):
1. Go to **App Runner** → **Create service**
2. Source: **Container registry** → **Amazon ECR** → browse to the `elevatr` repo/`latest` tag
3. Deployment trigger: **Manual** (or Automatic if you want it to redeploy on every image push)
4. Port: `8000`
5. **Environment variables** (Configure service step) — add these:
   | Key | Value |
   |---|---|
   | `GROQ_API_KEY` | your real Groq key |
   | `SECRET_KEY` | a long random string (`python -c "import secrets; print(secrets.token_hex(32))"`) |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
   | `DATABASE_URL` | `sqlite:///./elevatr.db` (see the storage caveat below) |
6. Health check path: `/health`
7. Create & deploy — App Runner gives you a URL like `https://xxxxxxxxxx.us-east-1.awsapprunner.com`

**Or via CLI**, if you'd rather script it:
```bash
aws apprunner create-service \
  --service-name elevatr \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "'$AWS_ACCOUNT_ID'.dkr.ecr.'$AWS_REGION'.amazonaws.com/elevatr:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "8000",
        "RuntimeEnvironmentVariables": {
          "GROQ_API_KEY": "your_key_here",
          "SECRET_KEY": "your_generated_secret",
          "DATABASE_URL": "sqlite:///./elevatr.db"
        }
      }
    },
    "AutoDeploymentsEnabled": false
  }' \
  --instance-configuration '{"Cpu": "1024", "Memory": "2048"}'
```

## 4. Visit your live URL

App Runner's default domain is already HTTPS — no extra certificate setup
needed. Open it, register an account, and run through the same flow you
tested locally.

## Known limitation worth knowing about: SQLite storage

App Runner containers have **ephemeral local storage** — anything written to
disk (your `elevatr.db` SQLite file) is wiped whenever the service redeploys
or restarts/scales. Fine for a demo/grading pass, but for real persistence
you'd swap `DATABASE_URL` for a managed Postgres instance (e.g. **Amazon
RDS**) instead of SQLite — that's a config-only change in `backend/.env`,
no code changes needed since the app already uses SQLAlchemy.

## Redeploying after a code change

```bash
docker build -t elevatr .
docker tag elevatr:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/elevatr:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/elevatr:latest
```
Then in the App Runner console, click **Deploy** (if automatic deployments
aren't enabled).
