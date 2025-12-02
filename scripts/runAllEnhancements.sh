#!/bin/bash

# Master script to run all database enhancements in sequence

echo "🚀 REBLD Database Enhancement Suite"
echo "===================================="
echo ""

# Set error handling
set -e

# Change to project directory
cd "$(dirname "$0")/.."

echo "📍 Working directory: $(pwd)"
echo ""

# Step 1: Main enhancement (roles, metrics, German translations)
echo "1️⃣ Running main enhancement (roles, metrics, German)..."
echo "---------------------------------------------------"
npx tsx scripts/enhanceDatabaseComplete.ts
echo ""
echo "✅ Main enhancement completed!"
echo ""

# Wait a bit between scripts
sleep 2

# Step 2: Add injury contraindications
echo "2️⃣ Adding injury contraindications..."
echo "-----------------------------------"
npx tsx scripts/addInjuryContraindications.ts
echo ""
echo "✅ Injury data added!"
echo ""

# Wait a bit between scripts
sleep 2

# Step 3: Create exercise relationships
echo "3️⃣ Creating exercise relationships..."
echo "-----------------------------------"
npx tsx scripts/createExerciseRelationships.ts
echo ""
echo "✅ Relationships created!"
echo ""

# Wait a bit before validation
sleep 2

# Step 4: Validate enhancements
echo "4️⃣ Validating all enhancements..."
echo "------------------------------"
npx tsx scripts/validateDatabaseEnhancement.ts
echo ""

echo "🎉 ALL ENHANCEMENTS COMPLETED!"
echo "===================================="
echo ""
echo "Next steps:"
echo "  - Review the validation report above"
echo "  - Check the Convex dashboard for data"
echo "  - Test the application with enhanced data"
echo ""
