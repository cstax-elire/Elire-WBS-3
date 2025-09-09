#!/bin/bash

# ==============================
# View Refresh Script
# Refresh all views in the elire_ops_1 database
# Useful after data updates or schema changes
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
echo -e "${GREEN}Refreshing Database Views${NC}"
echo -e "${GREEN}==================================${NC}"

# Check if database exists
if ! psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${RED}Error: Database $DB_NAME does not exist.${NC}"
    echo -e "Run ${YELLOW}./init-database.sh${NC} first to create the database."
    exit 1
fi

echo -e "Database: ${YELLOW}$DB_NAME${NC}"

# Refresh views
echo -e "${GREEN}Refreshing views...${NC}"
VIEW_COUNT=0

for file in "$BASE_DIR"/03-views/*.sql; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo -e "  Refreshing views from $filename..."
        psql -d "$DB_NAME" -f "$file" --quiet
        ((VIEW_COUNT++))
    fi
done

# Count total views
TOTAL_VIEWS=$(psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public';")

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}View refresh complete!${NC}"
echo -e "${GREEN}==================================${NC}"

echo -e "  Files processed: $VIEW_COUNT"
echo -e "  Total views in database: ${TOTAL_VIEWS// /}"

# Show sample of key views
echo -e "\n${GREEN}Key views available:${NC}"
psql -d "$DB_NAME" -c "SELECT table_name as view_name FROM information_schema.views WHERE table_schema = 'public' AND table_name LIKE 'v_rosetta%' ORDER BY table_name;" --tuples-only | while read view; do
    echo -e "  • $view"
done

echo -e "\n${GREEN}Organization views:${NC}"
psql -d "$DB_NAME" -c "SELECT table_name as view_name FROM information_schema.views WHERE table_schema = 'public' AND table_name LIKE 'v_org%' ORDER BY table_name;" --tuples-only | while read view; do
    echo -e "  • $view"
done

echo -e "\nYou can query these views with:"
echo -e "  ${YELLOW}psql -d $DB_NAME -c \"SELECT * FROM <view_name> LIMIT 10;\"${NC}"