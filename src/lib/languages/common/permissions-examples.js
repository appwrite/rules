/**
 * Essential permission patterns for Appwrite
 *
 * These examples demonstrate the key patterns for building
 * secure applications with Appwrite's permission system.
 */

/**
 * Permission patterns for each SDK
 * @type {Record<string, { userPermissions: string, teamPermissions: string, teamIsolation: string }>}
 */
const permissionPatterns = {
	javascript: {
		userPermissions: `// User-specific permissions: use for personal/owned resources
Permission.read(Role.user('<USER_ID>'))
Permission.write(Role.user('<USER_ID>'))`,

		teamPermissions: `// Team-based permissions: use for shared/collaborative resources
Permission.read(Role.team('<TEAM_ID>', 'member'))
Permission.update(Role.team('<TEAM_ID>', 'admin'))
Permission.delete(Role.team('<TEAM_ID>', 'owner'))`,

		teamIsolation: `// Set team permissions when creating rows
await tablesDB.createRow({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  rowId: ID.unique(),
  data: { title: 'Team Resource' },
  permissions: [
    Permission.read(Role.team('<TEAM_ID>')),
    Permission.write(Role.team('<TEAM_ID>', 'admin'))
  ]
});

// Appwrite automatically filters — only returns rows the user has access to
const response = await tablesDB.listRows({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>'
});`
	},

	python: {
		userPermissions: `# User-specific permissions: use for personal/owned resources
Permission.read(Role.user('<USER_ID>'))
Permission.write(Role.user('<USER_ID>'))`,

		teamPermissions: `# Team-based permissions: use for shared/collaborative resources
Permission.read(Role.team('<TEAM_ID>', 'member'))
Permission.update(Role.team('<TEAM_ID>', 'admin'))
Permission.delete(Role.team('<TEAM_ID>', 'owner'))`,

		teamIsolation: `# Set team permissions when creating rows
tables_db.create_row(
    '<DATABASE_ID>',
    '<TABLE_ID>',
    ID.unique(),
    {'title': 'Team Resource'},
    [
        Permission.read(Role.team('<TEAM_ID>')),
        Permission.write(Role.team('<TEAM_ID>', 'admin'))
    ]
)

# Appwrite automatically filters — only returns rows the user has access to
response = tables_db.list_rows(
    '<DATABASE_ID>',
    '<TABLE_ID>'
)`
	},

	php: {
		userPermissions: `// User-specific permissions: use for personal/owned resources
Permission::read(Role::user('<USER_ID>'))
Permission::write(Role::user('<USER_ID>'))`,

		teamPermissions: `// Team-based permissions: use for shared/collaborative resources
Permission::read(Role::team('<TEAM_ID>', 'member'))
Permission::update(Role::team('<TEAM_ID>', 'admin'))
Permission::delete(Role::team('<TEAM_ID>', 'owner'))`,

		teamIsolation: `// Set team permissions when creating rows
$tablesDB->createRow(
    '<DATABASE_ID>',
    '<TABLE_ID>',
    ID::unique(),
    ['title' => 'Team Resource'],
    [
        Permission::read(Role::team('<TEAM_ID>')),
        Permission::write(Role::team('<TEAM_ID>', 'admin'))
    ]
);

// Appwrite automatically filters — only returns rows the user has access to
$response = $tablesDB->listRows(
    '<DATABASE_ID>',
    '<TABLE_ID>'
);`
	},

	kotlin: {
		userPermissions: `// User-specific permissions: use for personal/owned resources
Permission.read(Role.user("<USER_ID>"))
Permission.write(Role.user("<USER_ID>"))`,

		teamPermissions: `// Team-based permissions: use for shared/collaborative resources
Permission.read(Role.team("<TEAM_ID>", "member"))
Permission.update(Role.team("<TEAM_ID>", "admin"))
Permission.delete(Role.team("<TEAM_ID>", "owner"))`,

		teamIsolation: `// Set team permissions when creating rows
tablesDB.createRow(
    databaseId = "<DATABASE_ID>",
    tableId = "<TABLE_ID>",
    rowId = ID.unique(),
    data = mapOf("title" to "Team Resource"),
    permissions = listOf(
        Permission.read(Role.team("<TEAM_ID>")),
        Permission.write(Role.team("<TEAM_ID>", "admin"))
    )
)

// Appwrite automatically filters — only returns rows the user has access to
val response = tablesDB.listRows(
    databaseId = "<DATABASE_ID>",
    tableId = "<TABLE_ID>"
)`
	},

	swift: {
		userPermissions: `// User-specific permissions: use for personal/owned resources
Permission.read(Role.user("<USER_ID>"))
Permission.write(Role.user("<USER_ID>"))`,

		teamPermissions: `// Team-based permissions: use for shared/collaborative resources
Permission.read(Role.team("<TEAM_ID>", "member"))
Permission.update(Role.team("<TEAM_ID>", "admin"))
Permission.delete(Role.team("<TEAM_ID>", "owner"))`,

		teamIsolation: `// Set team permissions when creating rows
let row = try await tablesDB.createRow(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    rowId: ID.unique(),
    data: ["title": "Team Resource"],
    permissions: [
        Permission.read(Role.team("<TEAM_ID>")),
        Permission.write(Role.team("<TEAM_ID>", "admin"))
    ]
)

// Appwrite automatically filters — only returns rows the user has access to
let response = try await tablesDB.listRows(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>"
)`
	},

	dart: {
		userPermissions: `// User-specific permissions: use for personal/owned resources
Permission.read(Role.user('<USER_ID>'))
Permission.write(Role.user('<USER_ID>'))`,

		teamPermissions: `// Team-based permissions: use for shared/collaborative resources
Permission.read(Role.team('<TEAM_ID>', 'member'))
Permission.update(Role.team('<TEAM_ID>', 'admin'))
Permission.delete(Role.team('<TEAM_ID>', 'owner'))`,

		teamIsolation: `// Set team permissions when creating rows
final row = await tablesDB.createRow(
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  rowId: ID.unique(),
  data: {'title': 'Team Resource'},
  permissions: [
    Permission.read(Role.team('<TEAM_ID>')),
    Permission.write(Role.team('<TEAM_ID>', 'admin')),
  ],
);

// Appwrite automatically filters — only returns rows the user has access to
final response = await tablesDB.listRows(
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
);`
	},

	go: {
		userPermissions: `// User-specific permissions: use for personal/owned resources
permission.Read(role.User("<USER_ID>"))
permission.Write(role.User("<USER_ID>"))`,

		teamPermissions: `// Team-based permissions: use for shared/collaborative resources
permission.Read(role.Team("<TEAM_ID>", "member"))
permission.Update(role.Team("<TEAM_ID>", "admin"))
permission.Delete(role.Team("<TEAM_ID>", "owner"))`,

		teamIsolation: `// Set team permissions when creating rows
row, err := tablesDB.CreateRow(
    "<DATABASE_ID>",
    "<TABLE_ID>",
    id.Unique(),
    map[string]interface{}{"title": "Team Resource"},
    tablesDB.WithCreateRowPermissions([]string{
        permission.Read(role.Team("<TEAM_ID>")),
        permission.Write(role.Team("<TEAM_ID>", "admin")),
    }),
)

// Appwrite automatically filters — only returns rows the user has access to
response, err := tablesDB.ListRows(
    "<DATABASE_ID>",
    "<TABLE_ID>",
)`
	},

	ruby: {
		userPermissions: `# User-specific permissions: use for personal/owned resources
Permission.read(Role.user('<USER_ID>'))
Permission.write(Role.user('<USER_ID>'))`,

		teamPermissions: `# Team-based permissions: use for shared/collaborative resources
Permission.read(Role.team('<TEAM_ID>', 'member'))
Permission.update(Role.team('<TEAM_ID>', 'admin'))
Permission.delete(Role.team('<TEAM_ID>', 'owner'))`,

		teamIsolation: `# Set team permissions when creating rows
tables_db.create_row(
  database_id: '<DATABASE_ID>',
  table_id: '<TABLE_ID>',
  row_id: Appwrite::ID.unique,
  data: { title: 'Team Resource' },
  permissions: [
    Permission.read(Role.team('<TEAM_ID>')),
    Permission.write(Role.team('<TEAM_ID>', 'admin'))
  ]
)

# Appwrite automatically filters — only returns rows the user has access to
response = tables_db.list_rows(
  database_id: '<DATABASE_ID>',
  table_id: '<TABLE_ID>'
)`
	},

	dotnet: {
		userPermissions: `// User-specific permissions: use for personal/owned resources
Permission.Read(Role.User("<USER_ID>"))
Permission.Write(Role.User("<USER_ID>"))`,

		teamPermissions: `// Team-based permissions: use for shared/collaborative resources
Permission.Read(Role.Team("<TEAM_ID>", "member"))
Permission.Update(Role.Team("<TEAM_ID>", "admin"))
Permission.Delete(Role.Team("<TEAM_ID>", "owner"))`,

		teamIsolation: `// Set team permissions when creating rows
var row = await tablesDB.CreateRow(
    "<DATABASE_ID>",
    "<TABLE_ID>",
    ID.Unique(),
    new Dictionary<string, object> { { "title", "Team Resource" } },
    new List<string>
    {
        Permission.Read(Role.Team("<TEAM_ID>")),
        Permission.Write(Role.Team("<TEAM_ID>", "admin"))
    }
);

// Appwrite automatically filters — only returns rows the user has access to
var response = await tablesDB.ListRows(
    "<DATABASE_ID>",
    "<TABLE_ID>"
);`
	}
};

/**
 * Get permission examples for a specific SDK
 * @param {string} sdk - The SDK name
 * @returns {{ userPermissions: string, teamPermissions: string, teamIsolation: string }} Permission pattern examples
 */
export function getPermissionExamples(sdk) {
	// Map SDK names to their pattern keys
	/** @type {Record<string, string>} */
	const sdkMap = {
		javascript: 'javascript',
		'react-native': 'javascript',
		python: 'python',
		php: 'php',
		go: 'go',
		ruby: 'ruby',
		dotnet: 'dotnet',
		swift: 'swift',
		kotlin: 'kotlin',
		apple: 'swift',
		android: 'kotlin',
		flutter: 'dart',
		dart: 'dart'
	};

	const patternKey = sdkMap[sdk] || 'javascript';
	return permissionPatterns[patternKey] || permissionPatterns.javascript;
}
