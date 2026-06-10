#!/bin/bash

# PM2 Smart Start Script
# Usage: ./scripts/pm2-start.sh [port]

CURRENT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd $CURRENT_DIR && cd ..


SERVICE_NAME=$(basename "$(pwd)")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}PM2 Smart Start Script${NC}"
echo -e "${BLUE}Service Name: ${SERVICE_NAME}${NC}"
echo -e "${BLUE}Current directory: $(pwd)${NC}"
echo -e "${BLUE}Current user: $(whoami)${NC}"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}PM2 is not installed. Please install it with: npm install -g pm2${NC}"
    exit 1
fi

# Check if ecosystem.config.js exists
if [ ! -f "ecosystem.config.js" ]; then
    echo -e "${RED}ecosystem.config.js not found in current directory${NC}"
    exit 1
fi

# Check if service exists in PM2
echo -e "${YELLOW}Checking if service '${SERVICE_NAME}' exists in PM2...${NC}"

check_service_exists() {
    PM2_ID=$(pm2 id "${SERVICE_NAME}" 2>/dev/null)
    if [ -n "$PM2_ID" ] && [ "$PM2_ID" != "[]" ]; then
        return 0
    else
        return 1
    fi  
}

# Use pm2 id to check if service exists
PM2_ID=$(pm2 id "${SERVICE_NAME}" 2>/dev/null)
echo -e "${YELLOW}PM2 ID result: '${PM2_ID}'${NC}"

if check_service_exists; then
    echo -e "${GREEN}Service '${SERVICE_NAME}' found in PM2 with ID: ${PM2_ID}${NC}"
    echo -e "${YELLOW}Restarting service...${NC}"
    
    # Restart the existing service
    pm2 restart "${SERVICE_NAME}"
 
else
    echo -e "${YELLOW}Service '${SERVICE_NAME}' not found in PM2${NC}"
    echo -e "${YELLOW}Starting new service...${NC}"
    
    echo -e "${YELLOW}Starting service with direct pm2 command...${NC}"
    pm2 start "npm start" --name "${SERVICE_NAME}" --time --restart-delay=5000
    
    if check_service_exists; then
        echo -e "${GREEN}Service '${SERVICE_NAME}' started successfully!${NC}"
    else
        echo -e "${RED}Failed to start service '${SERVICE_NAME}'${NC}"
        exit 1
    fi
fi

# Show final status
echo -e "${BLUE}Final PM2 status:${NC}"
pm2 list | grep "${SERVICE_NAME}"

echo -e "${GREEN}Operation completed successfully!${NC}"