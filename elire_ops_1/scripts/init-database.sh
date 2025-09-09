#!/bin/bash

# ==============================
# Database Initialization Script
# Initialize complete elire_ops_1 database from scratch
# ==============================

set -e  # Exit on error

# Configuration
DB_NAME="${1:-elire_ops_1}"
SCRIPT_DIR="$(dirname "$0")"
BASE_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}Elire Operations Database Setup${NC}"
echo -e "${GREEN}==================================${NC}"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}Warning: Database $DB_NAME already exists.${NC}"
    read -p "Do you want to drop and recreate it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Dropping existing database...${NC}"
        psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
    else
        echo -e "${RED}Exiting without changes.${NC}"
        exit 1
    fi
fi

# Create database
echo -e "${GREEN}Creating database $DB_NAME...${NC}"
psql -c "CREATE DATABASE $DB_NAME;"

# Load schema
echo -e "${GREEN}Loading schema...${NC}"
for file in "$BASE_DIR"/01-schema/*.sql; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo -e "  Loading $filename..."
        psql -d "$DB_NAME" -f "$file" --quiet
    fi
done

# Load seed data
echo -e "${GREEN}Loading seed data...${NC}"
for file in "$BASE_DIR"/02-seed/*.sql; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo -e "  Loading $filename..."
        psql -d "$DB_NAME" -f "$file" --quiet
    fi
done

# Create views
echo -e "${GREEN}Creating views...${NC}"
for file in "$BASE_DIR"/03-views/*.sql; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo -e "  Loading $filename..."
        psql -d "$DB_NAME" -f "$file" --quiet
    fi
done

# Apply migrations (if any exist)
if ls "$BASE_DIR"/04-migrations/*.sql 1> /dev/null 2>&1; then
    echo -e "${GREEN}Applying migrations...${NC}"
    for file in "$BASE_DIR"/04-migrations/*.sql; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo -e "  Applying $filename..."
            psql -d "$DB_NAME" -f "$file" --quiet
        fi
    done
fi

# Verify installation
echo -e "${GREEN}Verifying installation...${NC}"

TABLE_COUNT=$(psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
VIEW_COUNT=$(psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public';")

echo -e "  Tables created: ${TABLE_COUNT// /}"
echo -e "  Views created: ${VIEW_COUNT// /}"

# Run basic validation queries
echo -e "${GREEN}Running validation queries...${NC}"

# Check core data
ORG_COUNT=$(psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM org_unit;")
UNIT_COUNT=$(psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM atomic_unit;")
PERSON_COUNT=$(psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM person;")

echo -e "  Organizations: ${ORG_COUNT// /}"
echo -e "  Atomic units: ${UNIT_COUNT// /}"
echo -e "  People: ${PERSON_COUNT// /}"

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}Database initialization complete!${NC}"
echo -e "${GREEN}==================================${NC}"

echo -e "\nYou can now connect to the database with:"
echo -e "  ${YELLOW}psql -d $DB_NAME${NC}"

echo -e "\nTry these queries to explore the data:"
echo -e "  ${YELLOW}SELECT * FROM v_rosetta_stone LIMIT 10;${NC}"
echo -e "  ${YELLOW}SELECT * FROM v_rosetta_truth WHERE is_misattributed = true;${NC}"
echo -e "  ${YELLOW}SELECT * FROM v_org_tree WHERE depth = 1;${NC}"