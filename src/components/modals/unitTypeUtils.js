// unitTypeUtils.js
// Shared utility functions for unit type management

// Unit type choices for dropdowns
export const UNIT_TYPE_CHOICES = {
    navy: [
        { value: 'navy_expeditionary_force', label: 'Expeditionary Force' },
        { value: 'navy_fleet', label: 'Fleet' },
        { value: 'navy_battle_group', label: 'Battle Group' },
        { value: 'navy_task_force', label: 'Task Force' },
        { value: 'navy_squadron', label: 'Squadron' },
        { value: 'navy_division', label: 'Division' },
        { value: 'navy_flight', label: 'Flight' },
        { value: 'navy_vessel', label: 'Individual Vessel' }
    ],
    aviation: [
        { value: 'aviation_air_wing', label: 'Air Wing' },
        { value: 'aviation_air_group', label: 'Air Group' },
        { value: 'aviation_squadron', label: 'Squadron' },
        { value: 'aviation_division', label: 'Division' },
        { value: 'aviation_flight', label: 'Flight' },
        { value: 'aviation_element', label: 'Element/Section' }
    ],
    ground: [
        { value: 'ground_corps', label: 'Corps' },
        { value: 'ground_division', label: 'Division' },
        { value: 'ground_brigade', label: 'Brigade/Regiment' },
        { value: 'ground_battalion', label: 'Battalion' },
        { value: 'ground_company', label: 'Company' },
        { value: 'ground_platoon', label: 'Platoon' },
        { value: 'ground_squad', label: 'Squad' },
        { value: 'ground_fire_team', label: 'Fire Team' }
    ]
};

// Helper function to format unit type for display
export const formatUnitType = (unitType) => {
    if (!unitType) return '';

    // Handle legacy format (e.g., "Corps", "Division")
    if (!unitType.includes('_')) return unitType;

    // Handle new format (e.g., "navy_fleet", "ground_division")
    const [category, ...typeParts] = unitType.split('_');
    const type = typeParts.join(' ');

    const categoryLabels = {
        'navy': 'Navy',
        'aviation': 'Naval Aviation',
        'ground': 'Ground'
    };

    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const formattedCategory = categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1);

    return `${formattedCategory}: ${formattedType}`;
};

// Get the category of a unit type
export const getUnitCategory = (unitType) => {
    if (!unitType || !unitType.includes('_')) return null;
    return unitType.split('_')[0];
};

// Get the base type without category
export const getUnitBaseType = (unitType) => {
    if (!unitType) return '';
    if (!unitType.includes('_')) return unitType;

    const [, ...typeParts] = unitType.split('_');
    return typeParts.join(' ');
};

// Check if a unit type is valid
export const isValidUnitType = (unitType) => {
    if (!unitType) return false;
    if (unitType === 'other') return true;

    return Object.values(UNIT_TYPE_CHOICES).some(category =>
        category.some(choice => choice.value === unitType)
    );
};

// Get the commanding rank for a unit type
export const getCommandingRank = (unitType) => {
    const commandStructure = {
        // Navy
        'navy_expeditionary_force': 'Fleet Admiral',
        'navy_fleet': 'Admiral',
        'navy_battle_group': 'Vice Admiral',
        'navy_task_force': 'Rear Admiral',
        'navy_squadron': 'Commodore/Captain',
        'navy_division': 'Commander',
        'navy_flight': 'Lieutenant Commander',
        'navy_vessel': 'Captain/Commander',

        // Aviation
        'aviation_air_wing': 'Colonel',
        'aviation_air_group': 'Lieutenant Colonel',
        'aviation_squadron': 'Major/Commander',
        'aviation_division': 'Captain/Lieutenant Commander',
        'aviation_flight': 'Lieutenant/Lieutenant JG',
        'aviation_element': 'Senior Pilot',

        // Ground
        'ground_corps': 'Lieutenant General',
        'ground_division': 'Major General',
        'ground_brigade': 'Brigadier General/Colonel',
        'ground_battalion': 'Lieutenant Colonel',
        'ground_company': 'Captain',
        'ground_platoon': 'Lieutenant',
        'ground_squad': 'Sergeant',
        'ground_fire_team': 'Corporal'
    };

    return commandStructure[unitType] || 'Unknown';
};

// Get valid parent unit types for a given unit type
export const getValidParentTypes = (unitType) => {
    const hierarchy = {
        // Navy
        'navy_fleet': ['navy_expeditionary_force'],
        'navy_battle_group': ['navy_fleet'],
        'navy_task_force': ['navy_battle_group'],
        'navy_squadron': ['navy_battle_group', 'navy_task_force'],
        'navy_division': ['navy_squadron', 'navy_task_force'],
        'navy_flight': ['navy_division'],
        'navy_vessel': ['navy_flight', 'navy_division', 'navy_squadron'],

        // Aviation
        'aviation_air_group': ['aviation_air_wing'],
        'aviation_squadron': ['aviation_air_group'],
        'aviation_division': ['aviation_squadron'],
        'aviation_flight': ['aviation_division'],
        'aviation_element': ['aviation_flight'],

        // Ground
        'ground_division': ['ground_corps'],
        'ground_brigade': ['ground_division'],
        'ground_battalion': ['ground_brigade'],
        'ground_company': ['ground_battalion'],
        'ground_platoon': ['ground_company'],
        'ground_squad': ['ground_platoon'],
        'ground_fire_team': ['ground_squad']
    };

    return hierarchy[unitType] || [];
};

// Get valid child unit types for a given unit type
export const getValidChildTypes = (unitType) => {
    const hierarchy = {
        // Navy
        'navy_expeditionary_force': ['navy_fleet'],
        'navy_fleet': ['navy_battle_group'],
        'navy_battle_group': ['navy_task_force', 'navy_squadron'],
        'navy_task_force': ['navy_squadron', 'navy_division'],
        'navy_squadron': ['navy_division', 'navy_vessel'],
        'navy_division': ['navy_flight', 'navy_vessel'],
        'navy_flight': ['navy_vessel'],

        // Aviation
        'aviation_air_wing': ['aviation_air_group'],
        'aviation_air_group': ['aviation_squadron'],
        'aviation_squadron': ['aviation_division'],
        'aviation_division': ['aviation_flight'],
        'aviation_flight': ['aviation_element'],

        // Ground
        'ground_corps': ['ground_division'],
        'ground_division': ['ground_brigade'],
        'ground_brigade': ['ground_battalion'],
        'ground_battalion': ['ground_company'],
        'ground_company': ['ground_platoon'],
        'ground_platoon': ['ground_squad'],
        'ground_squad': ['ground_fire_team']
    };

    return hierarchy[unitType] || [];
};