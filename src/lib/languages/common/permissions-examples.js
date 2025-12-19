/**
 * Essential permission patterns for Appwrite multi-tenancy
 * 
 * These examples demonstrate the critical patterns that differentiate
 * good multi-tenant architecture from poor practices. For full API
 * documentation, see the official Appwrite docs.
 */

/**
 * Permission patterns for each SDK
 * Only includes the essential anti-pattern vs correct pattern examples
 */
const permissionPatterns = {
	javascript: {
		avoidUserPermissions: `// DON'T: User-specific permissions don't scale
Permission.read(Role.user('<USER_ID>'))
Permission.write(Role.user('<USER_ID>'))`,
		
		preferTeamPermissions: `// DO: Team-based permissions scale with your organization
Permission.read(Role.team('<TEAM_ID>', 'member'))
Permission.update(Role.team('<TEAM_ID>', 'admin'))
Permission.delete(Role.team('<TEAM_ID>', 'owner'))`,
		
		queryWithTeamId: `// ALWAYS filter by teamId for tenant isolation
const response = await tablesDB.listRows(
  '<DATABASE_ID>',
  '<TABLE_ID>',
  [
    Query.equal('teamId', '<TEAM_ID>'),  // Critical for isolation
    Query.orderDesc('$createdAt'),
    Query.limit(25)
  ]
);`,
		
		roleCheck: `// Verify permissions before sensitive operations
const memberships = await teams.listMemberships('<TEAM_ID>');
const membership = memberships.memberships.find(m => m.userId === userId);

if (!membership?.roles.includes('admin')) {
  throw new Error('Insufficient permissions');
}`
	},
	
	python: {
		avoidUserPermissions: `# DON'T: User-specific permissions don't scale
Permission.read(Role.user('<USER_ID>'))
Permission.write(Role.user('<USER_ID>'))`,
		
		preferTeamPermissions: `# DO: Team-based permissions scale with your organization
Permission.read(Role.team('<TEAM_ID>', 'member'))
Permission.update(Role.team('<TEAM_ID>', 'admin'))
Permission.delete(Role.team('<TEAM_ID>', 'owner'))`,
		
		queryWithTeamId: `# ALWAYS filter by teamId for tenant isolation
response = tables_db.list_rows(
    database_id='<DATABASE_ID>',
    table_id='<TABLE_ID>',
    queries=[
        Query.equal('teamId', '<TEAM_ID>'),  # Critical for isolation
        Query.order_desc('$createdAt'),
        Query.limit(25)
    ]
)`,
		
		roleCheck: `# Verify permissions before sensitive operations
memberships = teams.list_memberships('<TEAM_ID>')
membership = next((m for m in memberships.memberships if m.user_id == user_id), None)

if not membership or 'admin' not in membership.roles:
    raise Exception('Insufficient permissions')`
	},
	
	php: {
		avoidUserPermissions: `// DON'T: User-specific permissions don't scale
Permission::read(Role::user('<USER_ID>'))
Permission::write(Role::user('<USER_ID>'))`,
		
		preferTeamPermissions: `// DO: Team-based permissions scale with your organization
Permission::read(Role::team('<TEAM_ID>', 'member'))
Permission::update(Role::team('<TEAM_ID>', 'admin'))
Permission::delete(Role::team('<TEAM_ID>', 'owner'))`,
		
		queryWithTeamId: `// ALWAYS filter by teamId for tenant isolation
$response = $tablesDB->listRows(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    queries: [
        Query::equal('teamId', '<TEAM_ID>'),  // Critical for isolation
        Query::orderDesc('$createdAt'),
        Query::limit(25)
    ]
);`,
		
		roleCheck: `// Verify permissions before sensitive operations
$memberships = $teams->listMemberships('<TEAM_ID>');
$membership = array_filter($memberships->memberships, fn($m) => $m->userId === $userId);

if (empty($membership) || !in_array('admin', current($membership)->roles)) {
    throw new Exception('Insufficient permissions');
}`
	},
	
	kotlin: {
		avoidUserPermissions: `// DON'T: User-specific permissions don't scale
Permission.read(Role.user("<USER_ID>"))
Permission.write(Role.user("<USER_ID>"))`,
		
		preferTeamPermissions: `// DO: Team-based permissions scale with your organization
Permission.read(Role.team("<TEAM_ID>", "member"))
Permission.update(Role.team("<TEAM_ID>", "admin"))
Permission.delete(Role.team("<TEAM_ID>", "owner"))`,
		
		queryWithTeamId: `// ALWAYS filter by teamId for tenant isolation
val response = tablesDB.listRows(
    databaseId = "<DATABASE_ID>",
    tableId = "<TABLE_ID>",
    queries = listOf(
        Query.equal("teamId", "<TEAM_ID>"),  // Critical for isolation
        Query.orderDesc("\$createdAt"),
        Query.limit(25)
    )
)`,
		
		roleCheck: `// Verify permissions before sensitive operations
val memberships = teams.listMemberships("<TEAM_ID>")
val membership = memberships.memberships.find { it.userId == userId }

if (membership == null || "admin" !in membership.roles) {
    throw Exception("Insufficient permissions")
}`
	},
	
	swift: {
		avoidUserPermissions: `// DON'T: User-specific permissions don't scale
Permission.read(Role.user("<USER_ID>"))
Permission.write(Role.user("<USER_ID>"))`,
		
		preferTeamPermissions: `// DO: Team-based permissions scale with your organization
Permission.read(Role.team("<TEAM_ID>", "member"))
Permission.update(Role.team("<TEAM_ID>", "admin"))
Permission.delete(Role.team("<TEAM_ID>", "owner"))`,
		
		queryWithTeamId: `// ALWAYS filter by teamId for tenant isolation
let response = try await tablesDB.listRows(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    queries: [
        Query.equal("teamId", "<TEAM_ID>"),  // Critical for isolation
        Query.orderDesc("$createdAt"),
        Query.limit(25)
    ]
)`,
		
		roleCheck: `// Verify permissions before sensitive operations
let memberships = try await teams.listMemberships("<TEAM_ID>")
guard let membership = memberships.memberships.first(where: { $0.userId == userId }),
      membership.roles.contains("admin") else {
    throw AppError.insufficientPermissions
}`
	},
	
	dart: {
		avoidUserPermissions: `// DON'T: User-specific permissions don't scale
Permission.read(Role.user('<USER_ID>'))
Permission.write(Role.user('<USER_ID>'))`,
		
		preferTeamPermissions: `// DO: Team-based permissions scale with your organization
Permission.read(Role.team('<TEAM_ID>', 'member'))
Permission.update(Role.team('<TEAM_ID>', 'admin'))
Permission.delete(Role.team('<TEAM_ID>', 'owner'))`,
		
		queryWithTeamId: `// ALWAYS filter by teamId for tenant isolation
final response = await tablesDB.listRows(
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  queries: [
    Query.equal('teamId', '<TEAM_ID>'),  // Critical for isolation
    Query.orderDesc('\$createdAt'),
    Query.limit(25),
  ],
);`,
		
		roleCheck: `// Verify permissions before sensitive operations
final memberships = await teams.listMemberships('<TEAM_ID>');
final membership = memberships.memberships.firstWhere(
  (m) => m.userId == userId,
  orElse: () => null,
);

if (membership == null || !membership.roles.contains('admin')) {
  throw Exception('Insufficient permissions');
}`
	},
	
	go: {
		avoidUserPermissions: `// DON'T: User-specific permissions don't scale
permission.Read(role.User("<USER_ID>"))
permission.Write(role.User("<USER_ID>"))`,
		
		preferTeamPermissions: `// DO: Team-based permissions scale with your organization
permission.Read(role.Team("<TEAM_ID>", "member"))
permission.Update(role.Team("<TEAM_ID>", "admin"))
permission.Delete(role.Team("<TEAM_ID>", "owner"))`,
		
		queryWithTeamId: `// ALWAYS filter by teamId for tenant isolation
response, err := tablesDB.ListRows(
    "<DATABASE_ID>",
    "<TABLE_ID>",
    tablesDB.WithListRowsQueries([]string{
        query.Equal("teamId", "<TEAM_ID>"),  // Critical for isolation
        query.OrderDesc("$createdAt"),
        query.Limit(25),
    }),
)`,
		
		roleCheck: `// Verify permissions before sensitive operations
memberships, _ := teams.ListMemberships("<TEAM_ID>")
var membership *models.Membership
for _, m := range memberships.Memberships {
    if m.UserId == userId {
        membership = &m
        break
    }
}

if membership == nil || !contains(membership.Roles, "admin") {
    return errors.New("insufficient permissions")
}`
	},
	
	ruby: {
		avoidUserPermissions: `# DON'T: User-specific permissions don't scale
Permission.read(Role.user('<USER_ID>'))
Permission.write(Role.user('<USER_ID>'))`,
		
		preferTeamPermissions: `# DO: Team-based permissions scale with your organization
Permission.read(Role.team('<TEAM_ID>', 'member'))
Permission.update(Role.team('<TEAM_ID>', 'admin'))
Permission.delete(Role.team('<TEAM_ID>', 'owner'))`,
		
		queryWithTeamId: `# ALWAYS filter by teamId for tenant isolation
response = tables_db.list_rows(
  database_id: '<DATABASE_ID>',
  table_id: '<TABLE_ID>',
  queries: [
    Query.equal('teamId', '<TEAM_ID>'),  # Critical for isolation
    Query.order_desc('$createdAt'),
    Query.limit(25)
  ]
)`,
		
		roleCheck: `# Verify permissions before sensitive operations
memberships = teams.list_memberships('<TEAM_ID>')
membership = memberships.memberships.find { |m| m.user_id == user_id }

unless membership&.roles&.include?('admin')
  raise 'Insufficient permissions'
end`
	},
	
	dotnet: {
		avoidUserPermissions: `// DON'T: User-specific permissions don't scale
Permission.Read(Role.User("<USER_ID>"))
Permission.Write(Role.User("<USER_ID>"))`,
		
		preferTeamPermissions: `// DO: Team-based permissions scale with your organization
Permission.Read(Role.Team("<TEAM_ID>", "member"))
Permission.Update(Role.Team("<TEAM_ID>", "admin"))
Permission.Delete(Role.Team("<TEAM_ID>", "owner"))`,
		
		queryWithTeamId: `// ALWAYS filter by teamId for tenant isolation
var response = await tablesDB.ListRows(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    queries: new List<string> {
        Query.Equal("teamId", "<TEAM_ID>"),  // Critical for isolation
        Query.OrderDesc("$createdAt"),
        Query.Limit(25)
    }
);`,
		
		roleCheck: `// Verify permissions before sensitive operations
var memberships = await teams.ListMemberships("<TEAM_ID>");
var membership = memberships.Memberships.FirstOrDefault(m => m.UserId == userId);

if (membership == null || !membership.Roles.Contains("admin"))
{
    throw new UnauthorizedAccessException("Insufficient permissions");
}`
	}
};

/**
 * Get permission examples for a specific SDK
 * @param {string} sdk - The SDK name
 * @returns {Object} Permission pattern examples
 */
export function getPermissionExamples(sdk) {
	// Map SDK names to their pattern keys
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
