/**
 * Language-specific permission examples for Appwrite
 * All examples are validated against official Appwrite documentation
 */

export const permissionExamples = {
	javascript: {
		avoidUserPermissions: `// DON'T do this for multi-tenant apps
import { TablesDB, Permission, Role } from 'appwrite';

await tablesDB.createRow({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  rowId: '<ROW_ID>',
  data: { title: 'My Row' },
  permissions: [
    Permission.read(Role.user('<USER_ID>')),
    Permission.write(Role.user('<USER_ID>'))
  ]
});`,
		preferTeamPermissions: `// DO this for multi-tenant apps
import { TablesDB, Permission, Role } from 'appwrite';

await tablesDB.createRow({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  rowId: '<ROW_ID>',
  data: { title: 'My Row' },
  permissions: [
    Permission.read(Role.team('<TEAM_ID>', 'owner')),
    Permission.read(Role.team('<TEAM_ID>', 'admin')),
    Permission.read(Role.team('<TEAM_ID>', 'member')),
    Permission.update(Role.team('<TEAM_ID>', 'owner')),
    Permission.update(Role.team('<TEAM_ID>', 'admin')),
    Permission.delete(Role.team('<TEAM_ID>', 'owner'))
  ]
});`,
		createTeam: `import { Client, Teams } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

// Create a team when a new tenant/organization signs up
const team = await teams.create({
  teamId: '<TEAM_ID>',  // Unique team ID (can be auto-generated)
  name: '<TEAM_NAME>',   // Display name
  roles: ['owner', 'admin', 'member']  // Optional: Array of role strings
});`,
		createMembershipEmail: `import { Client, Teams } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

// Send team invitation (email-based)
const invite = await teams.createMembership({
  teamId: '<TEAM_ID>',
  roles: ['admin', 'member'],
  email: 'user@example.com',
  url: 'https://yourapp.com/accept-invite'  // Invitation redirect URL
});`,
		createMembershipUserId: `import { Client, Teams } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

// Or invite by user ID (if user already exists)
const membership = await teams.createMembership({
  teamId: '<TEAM_ID>',
  roles: ['admin', 'member'],
  userId: '<USER_ID>'
});`,
		listMemberships: `import { Client, Teams } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

// Get all members of a team
const response = await teams.listMemberships({
  teamId: '<TEAM_ID>'
});

// Access member data
response.memberships.forEach(membership => {
  console.log(membership.userId);
  console.log(membership.roles);      // Array of role strings
  console.log(membership.userName);
  console.log(membership.userEmail);
});`,
		updateMembership: `import { Client, Teams } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

// Update a member's roles (only team owners/admins can do this)
await teams.updateMembership({
  teamId: '<TEAM_ID>',
  membershipId: '<MEMBERSHIP_ID>',
  roles: ['admin', 'member']  // New roles array
});`,
		deleteMembership: `import { Client, Teams } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

// Remove a member from a team
await teams.deleteMembership({
  teamId: '<TEAM_ID>',
  membershipId: '<MEMBERSHIP_ID>'
});`,
		listTeams: `import { Client, Teams } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

// List all teams the current user belongs to
const response = await teams.list();

response.teams.forEach(team => {
  console.log(team.$id);
  console.log(team.name);
});`,
		getUserRole: `import { Client, Teams } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

// Get membership details for current user in a specific team
const response = await teams.listMemberships({
  teamId: '<TEAM_ID>'
});

const userMembership = response.memberships.find(
  m => m.userId === '<CURRENT_USER_ID>'
);

if (userMembership) {
  console.log(userMembership.roles);  // ['owner', 'admin', etc.]
  const hasAdminRole = userMembership.roles.includes('admin');
}`,
		createRow: `import { Client, TablesDB, Permission, Role } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const tablesDB = new TablesDB(client);

// Create row with team-based permissions
await tablesDB.createRow({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  rowId: '<ROW_ID>',
  data: {
    title: 'My Row',
    teamId: '<TEAM_ID>',  // Always store teamId for querying
    // ... other fields
  },
  permissions: [
    // Owners and admins can do everything
    Permission.read(Role.team('<TEAM_ID>', 'owner')),
    Permission.read(Role.team('<TEAM_ID>', 'admin')),
    Permission.read(Role.team('<TEAM_ID>', 'member')),
    Permission.update(Role.team('<TEAM_ID>', 'owner')),
    Permission.update(Role.team('<TEAM_ID>', 'admin')),
    Permission.delete(Role.team('<TEAM_ID>', 'owner')),
    Permission.delete(Role.team('<TEAM_ID>', 'admin'))
  ]
});`,
		createTable: `import { Client, TablesDB, Permission, Role } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>')
  .setKey('<API_KEY>');  // Server SDK requires API key

const tablesDB = new TablesDB(client);

// Create table with team-based permissions
await tablesDB.createTable({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  name: '<TABLE_NAME>',
  permissions: [
    // Table permissions
    Permission.create(Role.team('<TEAM_ID>', 'member')),
    Permission.read(Role.team('<TEAM_ID>', 'member')),
    Permission.update(Role.team('<TEAM_ID>', 'admin')),
    Permission.delete(Role.team('<TEAM_ID>', 'owner'))
  ]
});`,
		listRows: `import { Client, TablesDB, Query } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const tablesDB = new TablesDB(client);

// ALWAYS filter by teamId to ensure tenant isolation
const response = await tablesDB.listRows({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  queries: [
    Query.equal('teamId', '<TEAM_ID>'),  // Critical: filter by team
    Query.orderDesc('$createdAt'),
    Query.limit(25)
  ]
});`,
		createFile: `import { Client, Storage, Permission, Role } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const storage = new Storage(client);

// Create file with team-based permissions
await storage.createFile({
  bucketId: '<BUCKET_ID>',
  fileId: '<FILE_ID>',
  file: fileInput,  // File object from input
  permissions: [
    Permission.read(Role.team('<TEAM_ID>', 'member')),
    Permission.update(Role.team('<TEAM_ID>', 'admin')),
    Permission.delete(Role.team('<TEAM_ID>', 'owner'))
  ]
});`,
		teamCreationFlow: `// When user creates account/organization
import { Client, Teams, ID } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

const team = await teams.create({
  teamId: ID.unique(),
  name: 'Company Name'
});

// Make creator an owner
await teams.createMembership({
  teamId: team.$id,
  roles: ['owner'],
  userId: '<USER_ID>'
});`,
		inviteFlow: `// Owner/admin invites new member
import { Client, Teams } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

const invite = await teams.createMembership({
  teamId: '<TEAM_ID>',
  roles: ['member'],  // Default role
  email: 'user@example.com',
  url: 'https://yourapp.com/accept-invite'  // Redirect after accepting
});
// User receives email, clicks link, accepts invitation`,
		memberListUI: `// Display all team members with their roles
import { Client, Teams } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

const response = await teams.listMemberships({
  teamId: '<TEAM_ID>'
});
// Show list with role badges and action buttons`,
		roleChange: `// Admin/owner changes member role
import { Client, Teams } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

await teams.updateMembership({
  teamId: '<TEAM_ID>',
  membershipId: '<MEMBERSHIP_ID>',
  roles: ['admin']
});`,
		memberRemoval: `// Remove member (with confirmation)
import { Client, Teams } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

await teams.deleteMembership({
  teamId: '<TEAM_ID>',
  membershipId: '<MEMBERSHIP_ID>'
});`,
		roleCheck: `const response = await teams.listMemberships({
  teamId: '<TEAM_ID>'
});

const membership = response.memberships.find(
  m => m.userId === '<CURRENT_USER_ID>'
);

if (!membership || !membership.roles.includes('admin')) {
  throw new Error('Insufficient permissions');
}`
	},
	'react-native': {
		// React Native uses the same syntax as JavaScript
		avoidUserPermissions: `// DON'T do this for multi-tenant apps
import { TablesDB, Permission, Role } from 'react-native-appwrite';

await tablesDB.createRow({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  rowId: '<ROW_ID>',
  data: { title: 'My Row' },
  permissions: [
    Permission.read(Role.user('<USER_ID>')),
    Permission.write(Role.user('<USER_ID>'))
  ]
});`,
		preferTeamPermissions: `// DO this for multi-tenant apps
import { TablesDB, Permission, Role } from 'react-native-appwrite';

await tablesDB.createRow({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  rowId: '<ROW_ID>',
  data: { title: 'My Row' },
  permissions: [
    Permission.read(Role.team('<TEAM_ID>', 'owner')),
    Permission.read(Role.team('<TEAM_ID>', 'admin')),
    Permission.read(Role.team('<TEAM_ID>', 'member')),
    Permission.update(Role.team('<TEAM_ID>', 'owner')),
    Permission.update(Role.team('<TEAM_ID>', 'admin')),
    Permission.delete(Role.team('<TEAM_ID>', 'owner'))
  ]
});`,
		createTeam: `import { Client, Teams } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

const team = await teams.create({
  teamId: '<TEAM_ID>',
  name: '<TEAM_NAME>',
  roles: ['owner', 'admin', 'member']
});`,
		createMembershipEmail: `import { Client, Teams } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

const invite = await teams.createMembership({
  teamId: '<TEAM_ID>',
  roles: ['admin', 'member'],
  email: 'user@example.com',
  url: 'https://yourapp.com/accept-invite'
});`,
		createMembershipUserId: `import { Client, Teams } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

const membership = await teams.createMembership({
  teamId: '<TEAM_ID>',
  roles: ['admin', 'member'],
  userId: '<USER_ID>'
});`,
		listMemberships: `import { Client, Teams } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

const response = await teams.listMemberships({
  teamId: '<TEAM_ID>'
});

response.memberships.forEach(membership => {
  console.log(membership.userId);
  console.log(membership.roles);
  console.log(membership.userName);
  console.log(membership.userEmail);
});`,
		updateMembership: `import { Client, Teams } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

await teams.updateMembership({
  teamId: '<TEAM_ID>',
  membershipId: '<MEMBERSHIP_ID>',
  roles: ['admin', 'member']
});`,
		deleteMembership: `import { Client, Teams } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

await teams.deleteMembership({
  teamId: '<TEAM_ID>',
  membershipId: '<MEMBERSHIP_ID>'
});`,
		listTeams: `import { Client, Teams } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

const response = await teams.list();

response.teams.forEach(team => {
  console.log(team.$id);
  console.log(team.name);
});`,
		getUserRole: `import { Client, Teams } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

const response = await teams.listMemberships({
  teamId: '<TEAM_ID>'
});

const userMembership = response.memberships.find(
  m => m.userId === '<CURRENT_USER_ID>'
);

if (userMembership) {
  console.log(userMembership.roles);
  const hasAdminRole = userMembership.roles.includes('admin');
}`,
		createRow: `import { Client, TablesDB, Permission, Role } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const tablesDB = new TablesDB(client);

await tablesDB.createRow({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  rowId: '<ROW_ID>',
  data: {
    title: 'My Row',
    teamId: '<TEAM_ID>',
  },
  permissions: [
    Permission.read(Role.team('<TEAM_ID>', 'owner')),
    Permission.read(Role.team('<TEAM_ID>', 'admin')),
    Permission.read(Role.team('<TEAM_ID>', 'member')),
    Permission.update(Role.team('<TEAM_ID>', 'owner')),
    Permission.update(Role.team('<TEAM_ID>', 'admin')),
    Permission.delete(Role.team('<TEAM_ID>', 'owner')),
    Permission.delete(Role.team('<TEAM_ID>', 'admin'))
  ]
});`,
		createTable: `import { Client, TablesDB, Permission, Role } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>')
  .setKey('<API_KEY>');

const tablesDB = new TablesDB(client);

await tablesDB.createTable({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  name: '<TABLE_NAME>',
  permissions: [
    Permission.create(Role.team('<TEAM_ID>', 'member')),
    Permission.read(Role.team('<TEAM_ID>', 'member')),
    Permission.update(Role.team('<TEAM_ID>', 'admin')),
    Permission.delete(Role.team('<TEAM_ID>', 'owner'))
  ]
});`,
		listRows: `import { Client, TablesDB, Query } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const tablesDB = new TablesDB(client);

const response = await tablesDB.listRows({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  queries: [
    Query.equal('teamId', '<TEAM_ID>'),
    Query.orderDesc('$createdAt'),
    Query.limit(25)
  ]
});`,
		createFile: `import { Client, Storage, Permission, Role } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const storage = new Storage(client);

await storage.createFile({
  bucketId: '<BUCKET_ID>',
  fileId: '<FILE_ID>',
  file: fileInput,
  permissions: [
    Permission.read(Role.team('<TEAM_ID>', 'member')),
    Permission.update(Role.team('<TEAM_ID>', 'admin')),
    Permission.delete(Role.team('<TEAM_ID>', 'owner'))
  ]
});`,
		teamCreationFlow: `import { Client, Teams, ID } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

const team = await teams.create({
  teamId: ID.unique(),
  name: 'Company Name'
});

await teams.createMembership({
  teamId: team.$id,
  roles: ['owner'],
  userId: '<USER_ID>'
});`,
		inviteFlow: `import { Client, Teams } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

const invite = await teams.createMembership({
  teamId: '<TEAM_ID>',
  roles: ['member'],
  email: 'user@example.com',
  url: 'https://yourapp.com/accept-invite'
});`,
		memberListUI: `import { Client, Teams } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

const response = await teams.listMemberships({
  teamId: '<TEAM_ID>'
});`,
		roleChange: `import { Client, Teams } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

await teams.updateMembership({
  teamId: '<TEAM_ID>',
  membershipId: '<MEMBERSHIP_ID>',
  roles: ['admin']
});`,
		memberRemoval: `import { Client, Teams } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const teams = new Teams(client);

await teams.deleteMembership({
  teamId: '<TEAM_ID>',
  membershipId: '<MEMBERSHIP_ID>'
});`,
		roleCheck: `const response = await teams.listMemberships({
  teamId: '<TEAM_ID>'
});

const membership = response.memberships.find(
  m => m.userId === '<CURRENT_USER_ID>'
);

if (!membership || !membership.roles.includes('admin')) {
  throw new Error('Insufficient permissions');
}`
	},
	python: {
		avoidUserPermissions: `# DON'T do this for multi-tenant apps
from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.models import Permission, Role

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

tables_db = TablesDB(client)

tables_db.create_row(
    database_id='<DATABASE_ID>',
    table_id='<TABLE_ID>',
    row_id='<ROW_ID>',
    data={'title': 'My Row'},
    permissions=[
        Permission.read(Role.user('<USER_ID>')),
        Permission.write(Role.user('<USER_ID>'))
    ]
)`,
		preferTeamPermissions: `# DO this for multi-tenant apps
from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.models import Permission, Role

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

tables_db = TablesDB(client)

tables_db.create_row(
    database_id='<DATABASE_ID>',
    table_id='<TABLE_ID>',
    row_id='<ROW_ID>',
    data={'title': 'My Row'},
    permissions=[
        Permission.read(Role.team('<TEAM_ID>', 'owner')),
        Permission.read(Role.team('<TEAM_ID>', 'admin')),
        Permission.read(Role.team('<TEAM_ID>', 'member')),
        Permission.update(Role.team('<TEAM_ID>', 'owner')),
        Permission.update(Role.team('<TEAM_ID>', 'admin')),
        Permission.delete(Role.team('<TEAM_ID>', 'owner'))
    ]
)`,
		createTeam: `from appwrite.client import Client
from appwrite.services.teams import Teams

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

teams = Teams(client)

# Create a team when a new tenant/organization signs up
team = teams.create(
    team_id='<TEAM_ID>',
    name='<TEAM_NAME>',
    roles=['owner', 'admin', 'member']  # optional
)`,
		createMembershipEmail: `from appwrite.client import Client
from appwrite.services.teams import Teams

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

teams = Teams(client)

# Send team invitation (email-based)
invite = teams.create_membership(
    team_id='<TEAM_ID>',
    roles=['admin', 'member'],
    email='user@example.com',
    url='https://yourapp.com/accept-invite'
)`,
		createMembershipUserId: `from appwrite.client import Client
from appwrite.services.teams import Teams

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_key('<API_KEY>')  # Server SDK

teams = Teams(client)

# Or invite by user ID (if user already exists)
membership = teams.create_membership(
    team_id='<TEAM_ID>',
    roles=['admin', 'member'],
    user_id='<USER_ID>'
)`,
		listMemberships: `from appwrite.client import Client
from appwrite.services.teams import Teams

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

teams = Teams(client)

# Get all members of a team
response = teams.list_memberships(team_id='<TEAM_ID>')

# Access member data
for membership in response['memberships']:
    print(membership['userId'])
    print(membership['roles'])  # Array of role strings
    print(membership['userName'])
    print(membership['userEmail'])`,
		updateMembership: `from appwrite.client import Client
from appwrite.services.teams import Teams

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

teams = Teams(client)

# Update a member's roles (only team owners/admins can do this)
teams.update_membership(
    team_id='<TEAM_ID>',
    membership_id='<MEMBERSHIP_ID>',
    roles=['admin', 'member']
)`,
		deleteMembership: `from appwrite.client import Client
from appwrite.services.teams import Teams

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

teams = Teams(client)

# Remove a member from a team
teams.delete_membership(
    team_id='<TEAM_ID>',
    membership_id='<MEMBERSHIP_ID>'
)`,
		listTeams: `from appwrite.client import Client
from appwrite.services.teams import Teams

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

teams = Teams(client)

# List all teams the current user belongs to
response = teams.list()

for team in response['teams']:
    print(team['$id'])
    print(team['name'])`,
		getUserRole: `from appwrite.client import Client
from appwrite.services.teams import Teams

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

teams = Teams(client)

# Get membership details for current user in a specific team
response = teams.list_memberships(team_id='<TEAM_ID>')

user_membership = next(
    (m for m in response['memberships'] if m['userId'] == '<CURRENT_USER_ID>'),
    None
)

if user_membership:
    print(user_membership['roles'])  # ['owner', 'admin', etc.]
    has_admin_role = 'admin' in user_membership['roles']`,
		createRow: `from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.models import Permission, Role

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

tables_db = TablesDB(client)

# Create row with team-based permissions
tables_db.create_row(
    database_id='<DATABASE_ID>',
    table_id='<TABLE_ID>',
    row_id='<ROW_ID>',
    data={
        'title': 'My Row',
        'teamId': '<TEAM_ID>',  # Always store teamId for querying
    },
    permissions=[
        Permission.read(Role.team('<TEAM_ID>', 'owner')),
        Permission.read(Role.team('<TEAM_ID>', 'admin')),
        Permission.read(Role.team('<TEAM_ID>', 'member')),
        Permission.update(Role.team('<TEAM_ID>', 'owner')),
        Permission.update(Role.team('<TEAM_ID>', 'admin')),
        Permission.delete(Role.team('<TEAM_ID>', 'owner')),
        Permission.delete(Role.team('<TEAM_ID>', 'admin'))
    ]
)`,
		createTable: `from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.models import Permission, Role

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_key('<API_KEY>')  # Server SDK requires API key

tables_db = TablesDB(client)

# Create table with team-based permissions
tables_db.create_table(
    database_id='<DATABASE_ID>',
    table_id='<TABLE_ID>',
    name='<TABLE_NAME>',
    permissions=[
        Permission.create(Role.team('<TEAM_ID>', 'member')),
        Permission.read(Role.team('<TEAM_ID>', 'member')),
        Permission.update(Role.team('<TEAM_ID>', 'admin')),
        Permission.delete(Role.team('<TEAM_ID>', 'owner'))
    ]
)`,
		listRows: `from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.query import Query

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

tables_db = TablesDB(client)

# ALWAYS filter by teamId to ensure tenant isolation
response = tables_db.list_rows(
    database_id='<DATABASE_ID>',
    table_id='<TABLE_ID>',
    queries=[
        Query.equal('teamId', '<TEAM_ID>'),  # Critical: filter by team
        Query.order_desc('$createdAt'),
        Query.limit(25)
    ]
)`,
		createFile: `from appwrite.client import Client
from appwrite.services.storage import Storage
from appwrite.models import Permission, Role

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

storage = Storage(client)

# Create file with team-based permissions
storage.create_file(
    bucket_id='<BUCKET_ID>',
    file_id='<FILE_ID>',
    file=file_input,
    permissions=[
        Permission.read(Role.team('<TEAM_ID>', 'member')),
        Permission.update(Role.team('<TEAM_ID>', 'admin')),
        Permission.delete(Role.team('<TEAM_ID>', 'owner'))
    ]
)`,
		teamCreationFlow: `# When user creates account/organization
from appwrite.client import Client
from appwrite.services.teams import Teams
from appwrite.id import ID

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

teams = Teams(client)

team = teams.create(
    team_id=ID.unique(),
    name='Company Name'
)

# Make creator an owner
teams.create_membership(
    team_id=team['$id'],
    roles=['owner'],
    user_id='<USER_ID>'
)`,
		inviteFlow: `# Owner/admin invites new member
from appwrite.client import Client
from appwrite.services.teams import Teams

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

teams = Teams(client)

invite = teams.create_membership(
    team_id='<TEAM_ID>',
    roles=['member'],  # Default role
    email='user@example.com',
    url='https://yourapp.com/accept-invite'
)
# User receives email, clicks link, accepts invitation`,
		memberListUI: `# Display all team members with their roles
from appwrite.client import Client
from appwrite.services.teams import Teams

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

teams = Teams(client)

response = teams.list_memberships(team_id='<TEAM_ID>')
# Show list with role badges and action buttons`,
		roleChange: `# Admin/owner changes member role
from appwrite.client import Client
from appwrite.services.teams import Teams

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

teams = Teams(client)

teams.update_membership(
    team_id='<TEAM_ID>',
    membership_id='<MEMBERSHIP_ID>',
    roles=['admin']
)`,
		memberRemoval: `# Remove member (with confirmation)
from appwrite.client import Client
from appwrite.services.teams import Teams

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
client.set_project('<PROJECT_ID>')
client.set_session('')

teams = Teams(client)

teams.delete_membership(
    team_id='<TEAM_ID>',
    membership_id='<MEMBERSHIP_ID>'
)`,
		roleCheck: `response = teams.list_memberships(team_id='<TEAM_ID>')

user_membership = next(
    (m for m in response['memberships'] if m['userId'] == '<CURRENT_USER_ID>'),
    None
)

if not user_membership or 'admin' not in user_membership['roles']:
    raise Exception('Insufficient permissions')`
	},
	php: {
		avoidUserPermissions: `<?php
// DON'T do this for multi-tenant apps
use Appwrite\\Client;
use Appwrite\\Services\\TablesDB;
use Appwrite\\Models\\Permission;
use Appwrite\\Models\\Role;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$tablesDB = new TablesDB($client);

$tablesDB->createRow(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    rowId: '<ROW_ID>',
    data: ['title' => 'My Row'],
    permissions: [
        Permission::read(Role::user('<USER_ID>')),
        Permission::write(Role::user('<USER_ID>'))
    ]
);`,
		preferTeamPermissions: `<?php
// DO this for multi-tenant apps
use Appwrite\\Client;
use Appwrite\\Services\\TablesDB;
use Appwrite\\Models\\Permission;
use Appwrite\\Models\\Role;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$tablesDB = new TablesDB($client);

$tablesDB->createRow(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    rowId: '<ROW_ID>',
    data: ['title' => 'My Row'],
    permissions: [
        Permission::read(Role::team('<TEAM_ID>', 'owner')),
        Permission::read(Role::team('<TEAM_ID>', 'admin')),
        Permission::read(Role::team('<TEAM_ID>', 'member')),
        Permission::update(Role::team('<TEAM_ID>', 'owner')),
        Permission::update(Role::team('<TEAM_ID>', 'admin')),
        Permission::delete(Role::team('<TEAM_ID>', 'owner'))
    ]
);`,
		createTeam: `<?php
use Appwrite\\Client;
use Appwrite\\Services\\Teams;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$teams = new Teams($client);

// Create a team when a new tenant/organization signs up
$team = $teams->create(
    teamId: '<TEAM_ID>',
    name: '<TEAM_NAME>',
    roles: ['owner', 'admin', 'member']  // optional
);`,
		createMembershipEmail: `<?php
use Appwrite\\Client;
use Appwrite\\Services\\Teams;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$teams = new Teams($client);

// Send team invitation (email-based)
$invite = $teams->createMembership(
    teamId: '<TEAM_ID>',
    roles: ['admin', 'member'],
    email: 'user@example.com',
    url: 'https://yourapp.com/accept-invite'
);`,
		createMembershipUserId: `<?php
use Appwrite\\Client;
use Appwrite\\Services\\Teams;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setKey('<API_KEY>');  // Server SDK

$teams = new Teams($client);

// Or invite by user ID (if user already exists)
$membership = $teams->createMembership(
    teamId: '<TEAM_ID>',
    roles: ['admin', 'member'],
    userId: '<USER_ID>'
);`,
		listMemberships: `<?php
use Appwrite\\Client;
use Appwrite\\Services\\Teams;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$teams = new Teams($client);

// Get all members of a team
$response = $teams->listMemberships(teamId: '<TEAM_ID>');

// Access member data
foreach ($response['memberships'] as $membership) {
    echo $membership['userId'];
    echo implode(', ', $membership['roles']);  // Array of role strings
    echo $membership['userName'];
    echo $membership['userEmail'];
}`,
		updateMembership: `<?php
use Appwrite\\Client;
use Appwrite\\Services\\Teams;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$teams = new Teams($client);

// Update a member's roles (only team owners/admins can do this)
$teams->updateMembership(
    teamId: '<TEAM_ID>',
    membershipId: '<MEMBERSHIP_ID>',
    roles: ['admin', 'member']
);`,
		deleteMembership: `<?php
use Appwrite\\Client;
use Appwrite\\Services\\Teams;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$teams = new Teams($client);

// Remove a member from a team
$teams->deleteMembership(
    teamId: '<TEAM_ID>',
    membershipId: '<MEMBERSHIP_ID>'
);`,
		listTeams: `<?php
use Appwrite\\Client;
use Appwrite\\Services\\Teams;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$teams = new Teams($client);

// List all teams the current user belongs to
$response = $teams->list();

foreach ($response['teams'] as $team) {
    echo $team['$id'];
    echo $team['name'];
}`,
		getUserRole: `<?php
use Appwrite\\Client;
use Appwrite\\Services\\Teams;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$teams = new Teams($client);

// Get membership details for current user in a specific team
$response = $teams->listMemberships(teamId: '<TEAM_ID>');

$userMembership = array_filter(
    $response['memberships'],
    fn($m) => $m['userId'] === '<CURRENT_USER_ID>'
);

if (!empty($userMembership)) {
    $membership = reset($userMembership);
    echo implode(', ', $membership['roles']);  // ['owner', 'admin', etc.]
    $hasAdminRole = in_array('admin', $membership['roles']);
}`,
		createRow: `<?php
use Appwrite\\Client;
use Appwrite\\Services\\TablesDB;
use Appwrite\\Models\\Permission;
use Appwrite\\Models\\Role;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$tablesDB = new TablesDB($client);

// Create row with team-based permissions
$tablesDB->createRow(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    rowId: '<ROW_ID>',
    data: [
        'title' => 'My Row',
        'teamId' => '<TEAM_ID>',  // Always store teamId for querying
    ],
    permissions: [
        Permission::read(Role::team('<TEAM_ID>', 'owner')),
        Permission::read(Role::team('<TEAM_ID>', 'admin')),
        Permission::read(Role::team('<TEAM_ID>', 'member')),
        Permission::update(Role::team('<TEAM_ID>', 'owner')),
        Permission::update(Role::team('<TEAM_ID>', 'admin')),
        Permission::delete(Role::team('<TEAM_ID>', 'owner')),
        Permission::delete(Role::team('<TEAM_ID>', 'admin'))
    ]
);`,
		createTable: `<?php
use Appwrite\\Client;
use Appwrite\\Services\\TablesDB;
use Appwrite\\Models\\Permission;
use Appwrite\\Models\\Role;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setKey('<API_KEY>');  // Server SDK requires API key

$tablesDB = new TablesDB($client);

// Create table with team-based permissions
$tablesDB->createTable(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    name: '<TABLE_NAME>',
    permissions: [
        Permission::create(Role::team('<TEAM_ID>', 'member')),
        Permission::read(Role::team('<TEAM_ID>', 'member')),
        Permission::update(Role::team('<TEAM_ID>', 'admin')),
        Permission::delete(Role::team('<TEAM_ID>', 'owner'))
    ]
);`,
		listRows: `<?php
use Appwrite\\Client;
use Appwrite\\Services\\TablesDB;
use Appwrite\\Query;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$tablesDB = new TablesDB($client);

// ALWAYS filter by teamId to ensure tenant isolation
$response = $tablesDB->listRows(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    queries: [
        Query::equal('teamId', '<TEAM_ID>'),  // Critical: filter by team
        Query::orderDesc('$createdAt'),
        Query::limit(25)
    ]
);`,
		createFile: `<?php
use Appwrite\\Client;
use Appwrite\\Services\\Storage;
use Appwrite\\Models\\Permission;
use Appwrite\\Models\\Role;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$storage = new Storage($client);

// Create file with team-based permissions
$storage->createFile(
    bucketId: '<BUCKET_ID>',
    fileId: '<FILE_ID>',
    file: $fileInput,
    permissions: [
        Permission::read(Role::team('<TEAM_ID>', 'member')),
        Permission::update(Role::team('<TEAM_ID>', 'admin')),
        Permission::delete(Role::team('<TEAM_ID>', 'owner'))
    ]
);`,
		teamCreationFlow: `<?php
// When user creates account/organization
use Appwrite\\Client;
use Appwrite\\Services\\Teams;
use Appwrite\\ID;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$teams = new Teams($client);

$team = $teams->create(
    teamId: ID::unique(),
    name: 'Company Name'
);

// Make creator an owner
$teams->createMembership(
    teamId: $team['$id'],
    roles: ['owner'],
    userId: '<USER_ID>'
);`,
		inviteFlow: `<?php
// Owner/admin invites new member
use Appwrite\\Client;
use Appwrite\\Services\\Teams;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$teams = new Teams($client);

$invite = $teams->createMembership(
    teamId: '<TEAM_ID>',
    roles: ['member'],  // Default role
    email: 'user@example.com',
    url: 'https://yourapp.com/accept-invite'
);
// User receives email, clicks link, accepts invitation`,
		memberListUI: `<?php
// Display all team members with their roles
use Appwrite\\Client;
use Appwrite\\Services\\Teams;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$teams = new Teams($client);

$response = $teams->listMemberships(teamId: '<TEAM_ID>');
// Show list with role badges and action buttons`,
		roleChange: `<?php
// Admin/owner changes member role
use Appwrite\\Client;
use Appwrite\\Services\\Teams;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$teams = new Teams($client);

$teams->updateMembership(
    teamId: '<TEAM_ID>',
    membershipId: '<MEMBERSHIP_ID>',
    roles: ['admin']
);`,
		memberRemoval: `<?php
// Remove member (with confirmation)
use Appwrite\\Client;
use Appwrite\\Services\\Teams;

$client = (new Client())
    ->setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession('');

$teams = new Teams($client);

$teams->deleteMembership(
    teamId: '<TEAM_ID>',
    membershipId: '<MEMBERSHIP_ID>'
);`,
		roleCheck: `$response = $teams->listMemberships(teamId: '<TEAM_ID>');

$userMembership = array_filter(
    $response['memberships'],
    fn($m) => $m['userId'] === '<CURRENT_USER_ID>'
);

if (empty($userMembership) || !in_array('admin', reset($userMembership)['roles'])) {
    throw new Exception('Insufficient permissions');
}`
	},
	go: {
		avoidUserPermissions: `// DON'T do this for multi-tenant apps
package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/tablesdb"
    "github.com/appwrite/sdk-for-go/models"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

tablesDB := tablesdb.New(client)

tablesDB.CreateRow(
    "<DATABASE_ID>",
    "<TABLE_ID>",
    "<ROW_ID>",
    map[string]interface{}{
        "title": "My Row",
    },
    []interface{}{
        models.PermissionRead(models.RoleUser("<USER_ID>")),
        models.PermissionWrite(models.RoleUser("<USER_ID>")),
    },
)`,
		preferTeamPermissions: `// DO this for multi-tenant apps
package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/tablesdb"
    "github.com/appwrite/sdk-for-go/models"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

tablesDB := tablesdb.New(client)

tablesDB.CreateRow(
    "<DATABASE_ID>",
    "<TABLE_ID>",
    "<ROW_ID>",
    map[string]interface{}{
        "title": "My Row",
    },
    []interface{}{
        models.PermissionRead(models.RoleTeam("<TEAM_ID>", "owner")),
        models.PermissionRead(models.RoleTeam("<TEAM_ID>", "admin")),
        models.PermissionRead(models.RoleTeam("<TEAM_ID>", "member")),
        models.PermissionUpdate(models.RoleTeam("<TEAM_ID>", "owner")),
        models.PermissionUpdate(models.RoleTeam("<TEAM_ID>", "admin")),
        models.PermissionDelete(models.RoleTeam("<TEAM_ID>", "owner")),
    },
)`,
		createTeam: `package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/teams"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

service := teams.New(client)

// Create a team when a new tenant/organization signs up
service.Create(
    "<TEAM_ID>",
    "<TEAM_NAME>",
    teams.WithCreateRoles([]interface{}{"owner", "admin", "member"}),
)`,
		createMembershipEmail: `package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/teams"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

service := teams.New(client)

// Send team invitation (email-based)
service.CreateMembership(
    "<TEAM_ID>",
    []interface{}{"admin", "member"},
    teams.WithCreateMembershipEmail("user@example.com"),
    teams.WithCreateMembershipUrl("https://yourapp.com/accept-invite"),
)`,
		createMembershipUserId: `package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/teams"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithKey("<API_KEY>"),  // Server SDK
)

service := teams.New(client)

// Or invite by user ID (if user already exists)
service.CreateMembership(
    "<TEAM_ID>",
    []interface{}{"admin", "member"},
    teams.WithCreateMembershipUserId("<USER_ID>"),
)`,
		listMemberships: `package main

import (
    "fmt"
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/teams"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

service := teams.New(client)

// Get all members of a team
response, _ := service.ListMemberships("<TEAM_ID>")

// Access member data
for _, membership := range response.Memberships {
    fmt.Println(membership.UserId)
    fmt.Println(membership.Roles)  // Array of role strings
    fmt.Println(membership.UserName)
    fmt.Println(membership.UserEmail)
}`,
		updateMembership: `package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/teams"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

service := teams.New(client)

// Update a member's roles (only team owners/admins can do this)
service.UpdateMembership(
    "<TEAM_ID>",
    "<MEMBERSHIP_ID>",
    []interface{}{"admin", "member"},
)`,
		deleteMembership: `package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/teams"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

service := teams.New(client)

// Remove a member from a team
service.DeleteMembership(
    "<TEAM_ID>",
    "<MEMBERSHIP_ID>",
)`,
		listTeams: `package main

import (
    "fmt"
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/teams"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

service := teams.New(client)

// List all teams the current user belongs to
response, _ := service.List()

for _, team := range response.Teams {
    fmt.Println(team.Id)
    fmt.Println(team.Name)
}`,
		getUserRole: `package main

import (
    "fmt"
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/teams"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

service := teams.New(client)

// Get membership details for current user in a specific team
response, _ := service.ListMemberships("<TEAM_ID>")

var userMembership *teams.Membership
for _, membership := range response.Memberships {
    if membership.UserId == "<CURRENT_USER_ID>" {
        userMembership = &membership
        break
    }
}

if userMembership != nil {
    fmt.Println(userMembership.Roles)  // ['owner', 'admin', etc.]
    hasAdminRole := false
    for _, role := range userMembership.Roles {
        if role == "admin" {
            hasAdminRole = true
            break
        }
    }
}`,
		createRow: `package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/tablesdb"
    "github.com/appwrite/sdk-for-go/models"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

tablesDB := tablesdb.New(client)

// Create row with team-based permissions
tablesDB.CreateRow(
    "<DATABASE_ID>",
    "<TABLE_ID>",
    "<ROW_ID>",
    map[string]interface{}{
        "title": "My Row",
        "teamId": "<TEAM_ID>",  // Always store teamId for querying
    },
    []interface{}{
        models.PermissionRead(models.RoleTeam("<TEAM_ID>", "owner")),
        models.PermissionRead(models.RoleTeam("<TEAM_ID>", "admin")),
        models.PermissionRead(models.RoleTeam("<TEAM_ID>", "member")),
        models.PermissionUpdate(models.RoleTeam("<TEAM_ID>", "owner")),
        models.PermissionUpdate(models.RoleTeam("<TEAM_ID>", "admin")),
        models.PermissionDelete(models.RoleTeam("<TEAM_ID>", "owner")),
        models.PermissionDelete(models.RoleTeam("<TEAM_ID>", "admin")),
    },
)`,
		createTable: `package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/tablesdb"
    "github.com/appwrite/sdk-for-go/models"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithKey("<API_KEY>"),  // Server SDK requires API key
)

tablesDB := tablesdb.New(client)

// Create table with team-based permissions
tablesDB.CreateTable(
    "<DATABASE_ID>",
    "<TABLE_ID>",
    "<TABLE_NAME>",
    tablesdb.WithCreateTablePermissions([]interface{}{
        models.PermissionCreate(models.RoleTeam("<TEAM_ID>", "member")),
        models.PermissionRead(models.RoleTeam("<TEAM_ID>", "member")),
        models.PermissionUpdate(models.RoleTeam("<TEAM_ID>", "admin")),
        models.PermissionDelete(models.RoleTeam("<TEAM_ID>", "owner")),
    }),
)`,
		listRows: `package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/tablesdb"
    "github.com/appwrite/sdk-for-go/query"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

tablesDB := tablesdb.New(client)

// ALWAYS filter by teamId to ensure tenant isolation
tablesDB.ListRows(
    "<DATABASE_ID>",
    "<TABLE_ID>",
    tablesdb.WithListRowsQueries([]interface{}{
        query.Equal("teamId", "<TEAM_ID>"),  // Critical: filter by team
        query.OrderDesc("$createdAt"),
        query.Limit(25),
    }),
)`,
		createFile: `package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/storage"
    "github.com/appwrite/sdk-for-go/models"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

storageService := storage.New(client)

// Create file with team-based permissions
storageService.CreateFile(
    "<BUCKET_ID>",
    "<FILE_ID>",
    fileInput,
    storage.WithCreateFilePermissions([]interface{}{
        models.PermissionRead(models.RoleTeam("<TEAM_ID>", "member")),
        models.PermissionUpdate(models.RoleTeam("<TEAM_ID>", "admin")),
        models.PermissionDelete(models.RoleTeam("<TEAM_ID>", "owner")),
    }),
)`,
		teamCreationFlow: `// When user creates account/organization
package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/teams"
    "github.com/appwrite/sdk-for-go/id"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

service := teams.New(client)

team, _ := service.Create(
    id.Unique(),
    "Company Name",
)

// Make creator an owner
service.CreateMembership(
    team.Id,
    []interface{}{"owner"},
    teams.WithCreateMembershipUserId("<USER_ID>"),
)`,
		inviteFlow: `// Owner/admin invites new member
package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/teams"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

service := teams.New(client)

service.CreateMembership(
    "<TEAM_ID>",
    []interface{}{"member"},  // Default role
    teams.WithCreateMembershipEmail("user@example.com"),
    teams.WithCreateMembershipUrl("https://yourapp.com/accept-invite"),
)
// User receives email, clicks link, accepts invitation`,
		memberListUI: `// Display all team members with their roles
package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/teams"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

service := teams.New(client)

response, _ := service.ListMemberships("<TEAM_ID>")
// Show list with role badges and action buttons`,
		roleChange: `// Admin/owner changes member role
package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/teams"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

service := teams.New(client)

service.UpdateMembership(
    "<TEAM_ID>",
    "<MEMBERSHIP_ID>",
    []interface{}{"admin"},
)`,
		memberRemoval: `// Remove member (with confirmation)
package main

import (
    "github.com/appwrite/sdk-for-go/client"
    "github.com/appwrite/sdk-for-go/teams"
)

client := client.New(
    client.WithEndpoint("https://<REGION>.cloud.appwrite.io/v1"),
    client.WithProject("<PROJECT_ID>"),
    client.WithSession(""),
)

service := teams.New(client)

service.DeleteMembership(
    "<TEAM_ID>",
    "<MEMBERSHIP_ID>",
)`,
		roleCheck: `response, _ := service.ListMemberships("<TEAM_ID>")

var userMembership *teams.Membership
for _, membership := range response.Memberships {
    if membership.UserId == "<CURRENT_USER_ID>" {
        userMembership = &membership
        break
    }
}

hasAdminRole := false
if userMembership != nil {
    for _, role := range userMembership.Roles {
        if role == "admin" {
            hasAdminRole = true
            break
        }
    }
}

if !hasAdminRole {
    panic("Insufficient permissions")
}`
	},
	ruby: {
		avoidUserPermissions: `# DON'T do this for multi-tenant apps
require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

tables_db = TablesDB.new(client)

tables_db.create_row(
  database_id: '<DATABASE_ID>',
  table_id: '<TABLE_ID>',
  row_id: '<ROW_ID>',
  data: {'title' => 'My Row'},
  permissions: [
    Permission.read(Role.user('<USER_ID>')),
    Permission.write(Role.user('<USER_ID>'))
  ]
)`,
		preferTeamPermissions: `# DO this for multi-tenant apps
require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

tables_db = TablesDB.new(client)

tables_db.create_row(
  database_id: '<DATABASE_ID>',
  table_id: '<TABLE_ID>',
  row_id: '<ROW_ID>',
  data: {'title' => 'My Row'},
  permissions: [
    Permission.read(Role.team('<TEAM_ID>', 'owner')),
    Permission.read(Role.team('<TEAM_ID>', 'admin')),
    Permission.read(Role.team('<TEAM_ID>', 'member')),
    Permission.update(Role.team('<TEAM_ID>', 'owner')),
    Permission.update(Role.team('<TEAM_ID>', 'admin')),
    Permission.delete(Role.team('<TEAM_ID>', 'owner'))
  ]
)`,
		createTeam: `require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

teams = Teams.new(client)

# Create a team when a new tenant/organization signs up
team = teams.create(
  team_id: '<TEAM_ID>',
  name: '<TEAM_NAME>',
  roles: ['owner', 'admin', 'member']  # optional
)`,
		createMembershipEmail: `require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

teams = Teams.new(client)

# Send team invitation (email-based)
invite = teams.create_membership(
  team_id: '<TEAM_ID>',
  roles: ['admin', 'member'],
  email: 'user@example.com',
  url: 'https://yourapp.com/accept-invite'
)`,
		createMembershipUserId: `require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_key('<API_KEY>')  # Server SDK

teams = Teams.new(client)

# Or invite by user ID (if user already exists)
membership = teams.create_membership(
  team_id: '<TEAM_ID>',
  roles: ['admin', 'member'],
  user_id: '<USER_ID>'
)`,
		listMemberships: `require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

teams = Teams.new(client)

# Get all members of a team
response = teams.list_memberships(team_id: '<TEAM_ID>')

# Access member data
response['memberships'].each do |membership|
  puts membership['userId']
  puts membership['roles']  # Array of role strings
  puts membership['userName']
  puts membership['userEmail']
end`,
		updateMembership: `require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

teams = Teams.new(client)

# Update a member's roles (only team owners/admins can do this)
teams.update_membership(
  team_id: '<TEAM_ID>',
  membership_id: '<MEMBERSHIP_ID>',
  roles: ['admin', 'member']
)`,
		deleteMembership: `require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

teams = Teams.new(client)

# Remove a member from a team
teams.delete_membership(
  team_id: '<TEAM_ID>',
  membership_id: '<MEMBERSHIP_ID>'
)`,
		listTeams: `require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

teams = Teams.new(client)

# List all teams the current user belongs to
response = teams.list

response['teams'].each do |team|
  puts team['$id']
  puts team['name']
end`,
		getUserRole: `require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

teams = Teams.new(client)

# Get membership details for current user in a specific team
response = teams.list_memberships(team_id: '<TEAM_ID>')

user_membership = response['memberships'].find do |m|
  m['userId'] == '<CURRENT_USER_ID>'
end

if user_membership
  puts user_membership['roles']  # ['owner', 'admin', etc.]
  has_admin_role = user_membership['roles'].include?('admin')
end`,
		createRow: `require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

tables_db = TablesDB.new(client)

# Create row with team-based permissions
tables_db.create_row(
  database_id: '<DATABASE_ID>',
  table_id: '<TABLE_ID>',
  row_id: '<ROW_ID>',
  data: {
    'title' => 'My Row',
    'teamId' => '<TEAM_ID>',  # Always store teamId for querying
  },
  permissions: [
    Permission.read(Role.team('<TEAM_ID>', 'owner')),
    Permission.read(Role.team('<TEAM_ID>', 'admin')),
    Permission.read(Role.team('<TEAM_ID>', 'member')),
    Permission.update(Role.team('<TEAM_ID>', 'owner')),
    Permission.update(Role.team('<TEAM_ID>', 'admin')),
    Permission.delete(Role.team('<TEAM_ID>', 'owner')),
    Permission.delete(Role.team('<TEAM_ID>', 'admin'))
  ]
)`,
		createTable: `require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_key('<API_KEY>')  # Server SDK requires API key

tables_db = TablesDB.new(client)

# Create table with team-based permissions
tables_db.create_table(
  database_id: '<DATABASE_ID>',
  table_id: '<TABLE_ID>',
  name: '<TABLE_NAME>',
  permissions: [
    Permission.create(Role.team('<TEAM_ID>', 'member')),
    Permission.read(Role.team('<TEAM_ID>', 'member')),
    Permission.update(Role.team('<TEAM_ID>', 'admin')),
    Permission.delete(Role.team('<TEAM_ID>', 'owner'))
  ]
)`,
		listRows: `require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

tables_db = TablesDB.new(client)

# ALWAYS filter by teamId to ensure tenant isolation
response = tables_db.list_rows(
  database_id: '<DATABASE_ID>',
  table_id: '<TABLE_ID>',
  queries: [
    Query.equal('teamId', '<TEAM_ID>'),  # Critical: filter by team
    Query.order_desc('$createdAt'),
    Query.limit(25)
  ]
)`,
		createFile: `require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

storage = Storage.new(client)

# Create file with team-based permissions
storage.create_file(
  bucket_id: '<BUCKET_ID>',
  file_id: '<FILE_ID>',
  file: file_input,
  permissions: [
    Permission.read(Role.team('<TEAM_ID>', 'member')),
    Permission.update(Role.team('<TEAM_ID>', 'admin')),
    Permission.delete(Role.team('<TEAM_ID>', 'owner'))
  ]
)`,
		teamCreationFlow: `# When user creates account/organization
require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

teams = Teams.new(client)

team = teams.create(
  team_id: ID.unique,
  name: 'Company Name'
)

# Make creator an owner
teams.create_membership(
  team_id: team['$id'],
  roles: ['owner'],
  user_id: '<USER_ID>'
)`,
		inviteFlow: `# Owner/admin invites new member
require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

teams = Teams.new(client)

invite = teams.create_membership(
  team_id: '<TEAM_ID>',
  roles: ['member'],  # Default role
  email: 'user@example.com',
  url: 'https://yourapp.com/accept-invite'
)
# User receives email, clicks link, accepts invitation`,
		memberListUI: `# Display all team members with their roles
require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

teams = Teams.new(client)

response = teams.list_memberships(team_id: '<TEAM_ID>')
# Show list with role badges and action buttons`,
		roleChange: `# Admin/owner changes member role
require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

teams = Teams.new(client)

teams.update_membership(
  team_id: '<TEAM_ID>',
  membership_id: '<MEMBERSHIP_ID>',
  roles: ['admin']
)`,
		memberRemoval: `# Remove member (with confirmation)
require 'appwrite'

include Appwrite

client = Client.new
  .set_endpoint('https://<REGION>.cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session('')

teams = Teams.new(client)

teams.delete_membership(
  team_id: '<TEAM_ID>',
  membership_id: '<MEMBERSHIP_ID>'
)`,
		roleCheck: `response = teams.list_memberships(team_id: '<TEAM_ID>')

user_membership = response['memberships'].find do |m|
  m['userId'] == '<CURRENT_USER_ID>'
end

if !user_membership || !user_membership['roles'].include?('admin')
  raise 'Insufficient permissions'
end`
	},
	dotnet: {
		avoidUserPermissions: `// DON'T do this for multi-tenant apps
using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

TablesDB tablesDB = new TablesDB(client);

await tablesDB.CreateRow(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    rowId: "<ROW_ID>",
    data: new { title = "My Row" },
    permissions: new List<string> {
        Permission.Read(Role.User("<USER_ID>")),
        Permission.Write(Role.User("<USER_ID>"))
    }
);`,
		preferTeamPermissions: `// DO this for multi-tenant apps
using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

TablesDB tablesDB = new TablesDB(client);

await tablesDB.CreateRow(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    rowId: "<ROW_ID>",
    data: new { title = "My Row" },
    permissions: new List<string> {
        Permission.Read(Role.Team("<TEAM_ID>", "owner")),
        Permission.Read(Role.Team("<TEAM_ID>", "admin")),
        Permission.Read(Role.Team("<TEAM_ID>", "member")),
        Permission.Update(Role.Team("<TEAM_ID>", "owner")),
        Permission.Update(Role.Team("<TEAM_ID>", "admin")),
        Permission.Delete(Role.Team("<TEAM_ID>", "owner"))
    }
);`,
		createTeam: `using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

Teams teams = new Teams(client);

// Create a team when a new tenant/organization signs up
Team team = await teams.Create(
    teamId: "<TEAM_ID>",
    name: "<TEAM_NAME>",
    roles: new List<string> { "owner", "admin", "member" }  // optional
);`,
		createMembershipEmail: `using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

Teams teams = new Teams(client);

// Send team invitation (email-based)
Membership invite = await teams.CreateMembership(
    teamId: "<TEAM_ID>",
    roles: new List<string> { "admin", "member" },
    email: "user@example.com",
    url: "https://yourapp.com/accept-invite"
);`,
		createMembershipUserId: `using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetKey("<API_KEY>");  // Server SDK

Teams teams = new Teams(client);

// Or invite by user ID (if user already exists)
Membership membership = await teams.CreateMembership(
    teamId: "<TEAM_ID>",
    roles: new List<string> { "admin", "member" },
    userId: "<USER_ID>"
);`,
		listMemberships: `using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

Teams teams = new Teams(client);

// Get all members of a team
MembershipList response = await teams.ListMemberships(teamId: "<TEAM_ID>");

// Access member data
foreach (var membership in response.Memberships) {
    Console.WriteLine(membership.UserId);
    Console.WriteLine(string.Join(", ", membership.Roles));  // Array of role strings
    Console.WriteLine(membership.UserName);
    Console.WriteLine(membership.UserEmail);
}`,
		updateMembership: `using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

Teams teams = new Teams(client);

// Update a member's roles (only team owners/admins can do this)
await teams.UpdateMembership(
    teamId: "<TEAM_ID>",
    membershipId: "<MEMBERSHIP_ID>",
    roles: new List<string> { "admin", "member" }
);`,
		deleteMembership: `using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

Teams teams = new Teams(client);

// Remove a member from a team
await teams.DeleteMembership(
    teamId: "<TEAM_ID>",
    membershipId: "<MEMBERSHIP_ID>"
);`,
		listTeams: `using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

Teams teams = new Teams(client);

// List all teams the current user belongs to
TeamList response = await teams.List();

foreach (var team in response.Teams) {
    Console.WriteLine(team.Id);
    Console.WriteLine(team.Name);
}`,
		getUserRole: `using Appwrite;
using Appwrite.Models;
using Appwrite.Services;
using System.Linq;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

Teams teams = new Teams(client);

// Get membership details for current user in a specific team
MembershipList response = await teams.ListMemberships(teamId: "<TEAM_ID>");

var userMembership = response.Memberships.FirstOrDefault(
    m => m.UserId == "<CURRENT_USER_ID>"
);

if (userMembership != null) {
    Console.WriteLine(string.Join(", ", userMembership.Roles));  // ['owner', 'admin', etc.]
    bool hasAdminRole = userMembership.Roles.Contains("admin");
}`,
		createRow: `using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

TablesDB tablesDB = new TablesDB(client);

// Create row with team-based permissions
await tablesDB.CreateRow(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    rowId: "<ROW_ID>",
    data: new {
        title = "My Row",
        teamId = "<TEAM_ID>",  // Always store teamId for querying
    },
    permissions: new List<string> {
        Permission.Read(Role.Team("<TEAM_ID>", "owner")),
        Permission.Read(Role.Team("<TEAM_ID>", "admin")),
        Permission.Read(Role.Team("<TEAM_ID>", "member")),
        Permission.Update(Role.Team("<TEAM_ID>", "owner")),
        Permission.Update(Role.Team("<TEAM_ID>", "admin")),
        Permission.Delete(Role.Team("<TEAM_ID>", "owner")),
        Permission.Delete(Role.Team("<TEAM_ID>", "admin"))
    }
);`,
		createTable: `using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetKey("<API_KEY>");  // Server SDK requires API key

TablesDB tablesDB = new TablesDB(client);

// Create table with team-based permissions
await tablesDB.CreateTable(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    name: "<TABLE_NAME>",
    permissions: new List<string> {
        Permission.Create(Role.Team("<TEAM_ID>", "member")),
        Permission.Read(Role.Team("<TEAM_ID>", "member")),
        Permission.Update(Role.Team("<TEAM_ID>", "admin")),
        Permission.Delete(Role.Team("<TEAM_ID>", "owner"))
    }
);`,
		listRows: `using Appwrite;
using Appwrite.Models;
using Appwrite.Services;
using Appwrite.Query;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

TablesDB tablesDB = new TablesDB(client);

// ALWAYS filter by teamId to ensure tenant isolation
RowList response = await tablesDB.ListRows(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    queries: new List<string> {
        Query.Equal("teamId", "<TEAM_ID>"),  // Critical: filter by team
        Query.OrderDesc("$createdAt"),
        Query.Limit(25)
    }
);`,
		createFile: `using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

Storage storage = new Storage(client);

// Create file with team-based permissions
await storage.CreateFile(
    bucketId: "<BUCKET_ID>",
    fileId: "<FILE_ID>",
    file: fileInput,
    permissions: new List<string> {
        Permission.Read(Role.Team("<TEAM_ID>", "member")),
        Permission.Update(Role.Team("<TEAM_ID>", "admin")),
        Permission.Delete(Role.Team("<TEAM_ID>", "owner"))
    }
);`,
		teamCreationFlow: `// When user creates account/organization
using Appwrite;
using Appwrite.Models;
using Appwrite.Services;
using Appwrite.ID;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

Teams teams = new Teams(client);

Team team = await teams.Create(
    teamId: ID.Unique(),
    name: "Company Name"
);

// Make creator an owner
await teams.CreateMembership(
    teamId: team.Id,
    roles: new List<string> { "owner" },
    userId: "<USER_ID>"
);`,
		inviteFlow: `// Owner/admin invites new member
using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

Teams teams = new Teams(client);

Membership invite = await teams.CreateMembership(
    teamId: "<TEAM_ID>",
    roles: new List<string> { "member" },  // Default role
    email: "user@example.com",
    url: "https://yourapp.com/accept-invite"
);
// User receives email, clicks link, accepts invitation`,
		memberListUI: `// Display all team members with their roles
using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

Teams teams = new Teams(client);

MembershipList response = await teams.ListMemberships(teamId: "<TEAM_ID>");
// Show list with role badges and action buttons`,
		roleChange: `// Admin/owner changes member role
using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

Teams teams = new Teams(client);

await teams.UpdateMembership(
    teamId: "<TEAM_ID>",
    membershipId: "<MEMBERSHIP_ID>",
    roles: new List<string> { "admin" }
);`,
		memberRemoval: `// Remove member (with confirmation)
using Appwrite;
using Appwrite.Models;
using Appwrite.Services;

Client client = new Client()
    .SetEndPoint("https://<REGION>.cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession("");

Teams teams = new Teams(client);

await teams.DeleteMembership(
    teamId: "<TEAM_ID>",
    membershipId: "<MEMBERSHIP_ID>"
);`,
		roleCheck: `MembershipList response = await teams.ListMemberships(teamId: "<TEAM_ID>");

var userMembership = response.Memberships.FirstOrDefault(
    m => m.UserId == "<CURRENT_USER_ID>"
);

if (userMembership == null || !userMembership.Roles.Contains("admin")) {
    throw new Exception("Insufficient permissions");
}`
	},
	swift: {
		avoidUserPermissions: `// DON'T do this for multi-tenant apps
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let tablesDB = TablesDB(client)

try await tablesDB.createRow(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    rowId: "<ROW_ID>",
    data: ["title": "My Row"],
    permissions: [
        Permission.read(Role.user("<USER_ID>")),
        Permission.write(Role.user("<USER_ID>"))
    ]
)`,
		preferTeamPermissions: `// DO this for multi-tenant apps
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let tablesDB = TablesDB(client)

try await tablesDB.createRow(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    rowId: "<ROW_ID>",
    data: ["title": "My Row"],
    permissions: [
        Permission.read(Role.team("<TEAM_ID>", "owner")),
        Permission.read(Role.team("<TEAM_ID>", "admin")),
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "owner")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner"))
    ]
)`,
		createTeam: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let teams = Teams(client)

// Create a team when a new tenant/organization signs up
let team = try await teams.create(
    teamId: "<TEAM_ID>",
    name: "<TEAM_NAME>",
    roles: ["owner", "admin", "member"]  // optional
)`,
		createMembershipEmail: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let teams = Teams(client)

// Send team invitation (email-based)
let invite = try await teams.createMembership(
    teamId: "<TEAM_ID>",
    roles: ["admin", "member"],
    email: "user@example.com",
    url: "https://yourapp.com/accept-invite"
)`,
		createMembershipUserId: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setKey("<API_KEY>")  // Server SDK

let teams = Teams(client)

// Or invite by user ID (if user already exists)
let membership = try await teams.createMembership(
    teamId: "<TEAM_ID>",
    roles: ["admin", "member"],
    userId: "<USER_ID>"
)`,
		listMemberships: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let teams = Teams(client)

// Get all members of a team
let response = try await teams.listMemberships(teamId: "<TEAM_ID>")

// Access member data
for membership in response.memberships {
    print(membership.userId)
    print(membership.roles)  // Array of role strings
    print(membership.userName ?? "")
    print(membership.userEmail ?? "")
}`,
		updateMembership: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let teams = Teams(client)

// Update a member's roles (only team owners/admins can do this)
try await teams.updateMembership(
    teamId: "<TEAM_ID>",
    membershipId: "<MEMBERSHIP_ID>",
    roles: ["admin", "member"]
)`,
		deleteMembership: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let teams = Teams(client)

// Remove a member from a team
try await teams.deleteMembership(
    teamId: "<TEAM_ID>",
    membershipId: "<MEMBERSHIP_ID>"
)`,
		listTeams: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let teams = Teams(client)

// List all teams the current user belongs to
let response = try await teams.list()

for team in response.teams {
    print(team.id)
    print(team.name)
}`,
		getUserRole: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let teams = Teams(client)

// Get membership details for current user in a specific team
let response = try await teams.listMemberships(teamId: "<TEAM_ID>")

let userMembership = response.memberships.first { $0.userId == "<CURRENT_USER_ID>" }

if let membership = userMembership {
    print(membership.roles)  // ['owner', 'admin', etc.]
    let hasAdminRole = membership.roles.contains("admin")
}`,
		createRow: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let tablesDB = TablesDB(client)

// Create row with team-based permissions
try await tablesDB.createRow(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    rowId: "<ROW_ID>",
    data: [
        "title": "My Row",
        "teamId": "<TEAM_ID>",  // Always store teamId for querying
    ],
    permissions: [
        Permission.read(Role.team("<TEAM_ID>", "owner")),
        Permission.read(Role.team("<TEAM_ID>", "admin")),
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "owner")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner")),
        Permission.delete(Role.team("<TEAM_ID>", "admin"))
    ]
)`,
		createTable: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setKey("<API_KEY>")  // Server SDK requires API key

let tablesDB = TablesDB(client)

// Create table with team-based permissions
try await tablesDB.createTable(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    name: "<TABLE_NAME>",
    permissions: [
        Permission.create(Role.team("<TEAM_ID>", "member")),
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner"))
    ]
)`,
		listRows: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let tablesDB = TablesDB(client)

// ALWAYS filter by teamId to ensure tenant isolation
let response = try await tablesDB.listRows(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    queries: [
        Query.equal("teamId", "<TEAM_ID>"),  // Critical: filter by team
        Query.orderDesc("$createdAt"),
        Query.limit(25)
    ]
)`,
		createFile: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let storage = Storage(client)

// Create file with team-based permissions
try await storage.createFile(
    bucketId: "<BUCKET_ID>",
    fileId: "<FILE_ID>",
    file: fileInput,
    permissions: [
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner"))
    ]
)`,
		teamCreationFlow: `// When user creates account/organization
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let teams = Teams(client)

let team = try await teams.create(
    teamId: ID.unique(),
    name: "Company Name"
)

// Make creator an owner
try await teams.createMembership(
    teamId: team.id,
    roles: ["owner"],
    userId: "<USER_ID>"
)`,
		inviteFlow: `// Owner/admin invites new member
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let teams = Teams(client)

let invite = try await teams.createMembership(
    teamId: "<TEAM_ID>",
    roles: ["member"],  // Default role
    email: "user@example.com",
    url: "https://yourapp.com/accept-invite"
)
// User receives email, clicks link, accepts invitation`,
		memberListUI: `// Display all team members with their roles
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let teams = Teams(client)

let response = try await teams.listMemberships(teamId: "<TEAM_ID>")
// Show list with role badges and action buttons`,
		roleChange: `// Admin/owner changes member role
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let teams = Teams(client)

try await teams.updateMembership(
    teamId: "<TEAM_ID>",
    membershipId: "<MEMBERSHIP_ID>",
    roles: ["admin"]
)`,
		memberRemoval: `// Remove member (with confirmation)
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

let teams = Teams(client)

try await teams.deleteMembership(
    teamId: "<TEAM_ID>",
    membershipId: "<MEMBERSHIP_ID>"
)`,
		roleCheck: `let response = try await teams.listMemberships(teamId: "<TEAM_ID>")

let userMembership = response.memberships.first { $0.userId == "<CURRENT_USER_ID>" }

if userMembership == nil || !userMembership!.roles.contains("admin") {
    throw NSError(domain: "Appwrite", code: 403, userInfo: [NSLocalizedDescriptionKey: "Insufficient permissions"])
}`
	},
	kotlin: {
		avoidUserPermissions: `// DON'T do this for multi-tenant apps
import io.appwrite.Client
import io.appwrite.services.TablesDB
import io.appwrite.models.Permission
import io.appwrite.models.Role

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val tablesDB = TablesDB(client)

tablesDB.createRow(
    databaseId = "<DATABASE_ID>",
    tableId = "<TABLE_ID>",
    rowId = "<ROW_ID>",
    data = mapOf("title" to "My Row"),
    permissions = listOf(
        Permission.read(Role.user("<USER_ID>")),
        Permission.write(Role.user("<USER_ID>"))
    )
)`,
		preferTeamPermissions: `// DO this for multi-tenant apps
import io.appwrite.Client
import io.appwrite.services.TablesDB
import io.appwrite.models.Permission
import io.appwrite.models.Role

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val tablesDB = TablesDB(client)

tablesDB.createRow(
    databaseId = "<DATABASE_ID>",
    tableId = "<TABLE_ID>",
    rowId = "<ROW_ID>",
    data = mapOf("title" to "My Row"),
    permissions = listOf(
        Permission.read(Role.team("<TEAM_ID>", "owner")),
        Permission.read(Role.team("<TEAM_ID>", "admin")),
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "owner")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner"))
    )
)`,
		createTeam: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val teams = Teams(client)

// Create a team when a new tenant/organization signs up
teams.create(
    "<TEAM_ID>",  // teamId
    "<TEAM_NAME>",  // name
    listOf("owner", "admin", "member")  // roles (optional)
)`,
		createMembershipEmail: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val teams = Teams(client)

// Send team invitation (email-based)
teams.createMembership(
    "<TEAM_ID>",  // teamId
    listOf("admin", "member"),  // roles
    "user@example.com",  // email
    null,  // userId (optional)
    null,  // phone (optional)
    "https://yourapp.com/accept-invite",  // url
    null  // name (optional)
)`,
		createMembershipUserId: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setKey("<API_KEY>")  // Server SDK

val teams = Teams(client)

// Or invite by user ID (if user already exists)
teams.createMembership(
    "<TEAM_ID>",  // teamId
    listOf("admin", "member"),  // roles
    null,  // email
    "<USER_ID>",  // userId
    null,  // phone
    null,  // url
    null  // name
)`,
		listMemberships: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val teams = Teams(client)

// Get all members of a team
val response = teams.listMemberships(
    "<TEAM_ID>",  // teamId
    listOf(),  // queries (optional)
    null  // search (optional)
)

// Access member data
response.memberships.forEach { membership ->
    println(membership.userId)
    println(membership.roles)  // Array of role strings
    println(membership.userName)
    println(membership.userEmail)
}`,
		updateMembership: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val teams = Teams(client)

// Update a member's roles (only team owners/admins can do this)
teams.updateMembership(
    "<TEAM_ID>",  // teamId
    "<MEMBERSHIP_ID>",  // membershipId
    listOf("admin", "member")  // roles
)`,
		deleteMembership: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val teams = Teams(client)

// Remove a member from a team
teams.deleteMembership(
    "<TEAM_ID>",  // teamId
    "<MEMBERSHIP_ID>"  // membershipId
)`,
		listTeams: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val teams = Teams(client)

// List all teams the current user belongs to
val response = teams.list(
    listOf(),  // queries (optional)
    null  // search (optional)
)

response.teams.forEach { team ->
    println(team.id)
    println(team.name)
}`,
		getUserRole: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val teams = Teams(client)

// Get membership details for current user in a specific team
val response = teams.listMemberships("<TEAM_ID>")

val userMembership = response.memberships.find {
    it.userId == "<CURRENT_USER_ID>"
}

if (userMembership != null) {
    println(userMembership.roles)  // ['owner', 'admin', etc.]
    val hasAdminRole = userMembership.roles.contains("admin")
}`,
		createRow: `import io.appwrite.Client
import io.appwrite.services.TablesDB
import io.appwrite.models.Permission
import io.appwrite.models.Role

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val tablesDB = TablesDB(client)

// Create row with team-based permissions
tablesDB.createRow(
    databaseId = "<DATABASE_ID>",
    tableId = "<TABLE_ID>",
    rowId = "<ROW_ID>",
    data = mapOf(
        "title" to "My Row",
        "teamId" to "<TEAM_ID>",  // Always store teamId for querying
    ),
    permissions = listOf(
        Permission.read(Role.team("<TEAM_ID>", "owner")),
        Permission.read(Role.team("<TEAM_ID>", "admin")),
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "owner")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner")),
        Permission.delete(Role.team("<TEAM_ID>", "admin"))
    )
)`,
		createTable: `import io.appwrite.Client
import io.appwrite.services.TablesDB
import io.appwrite.models.Permission
import io.appwrite.models.Role

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setKey("<API_KEY>")  // Server SDK requires API key

val tablesDB = TablesDB(client)

// Create table with team-based permissions
tablesDB.createTable(
    databaseId = "<DATABASE_ID>",
    tableId = "<TABLE_ID>",
    name = "<TABLE_NAME>",
    permissions = listOf(
        Permission.create(Role.team("<TEAM_ID>", "member")),
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner"))
    )
)`,
		listRows: `import io.appwrite.Client
import io.appwrite.services.TablesDB
import io.appwrite.Query

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val tablesDB = TablesDB(client)

// ALWAYS filter by teamId to ensure tenant isolation
val response = tablesDB.listRows(
    databaseId = "<DATABASE_ID>",
    tableId = "<TABLE_ID>",
    queries = listOf(
        Query.equal("teamId", "<TEAM_ID>"),  // Critical: filter by team
        Query.orderDesc("$createdAt"),
        Query.limit(25)
    )
)`,
		createFile: `import io.appwrite.Client
import io.appwrite.services.Storage
import io.appwrite.models.Permission
import io.appwrite.models.Role

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val storage = Storage(client)

// Create file with team-based permissions
storage.createFile(
    bucketId = "<BUCKET_ID>",
    fileId = "<FILE_ID>",
    file = fileInput,
    permissions = listOf(
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner"))
    )
)`,
		teamCreationFlow: `// When user creates account/organization
import io.appwrite.Client
import io.appwrite.services.Teams
import io.appwrite.ID

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val teams = Teams(client)

val team = teams.create(
    ID.unique(),
    "Company Name"
)

// Make creator an owner
teams.createMembership(
    team.id,  // teamId
    listOf("owner"),  // roles
    null,  // email
    "<USER_ID>",  // userId
    null,  // phone
    null,  // url
    null  // name
)`,
		inviteFlow: `// Owner/admin invites new member
import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val teams = Teams(client)

teams.createMembership(
    "<TEAM_ID>",  // teamId
    listOf("member"),  // Default role
    "user@example.com",  // email
    null,  // userId
    null,  // phone
    "https://yourapp.com/accept-invite",  // url
    null  // name
)
// User receives email, clicks link, accepts invitation`,
		memberListUI: `// Display all team members with their roles
import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val teams = Teams(client)

val response = teams.listMemberships("<TEAM_ID>")
// Show list with role badges and action buttons`,
		roleChange: `// Admin/owner changes member role
import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val teams = Teams(client)

teams.updateMembership(
    "<TEAM_ID>",  // teamId
    "<MEMBERSHIP_ID>",  // membershipId
    listOf("admin")  // roles
)`,
		memberRemoval: `// Remove member (with confirmation)
import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession("")

val teams = Teams(client)

teams.deleteMembership(
    "<TEAM_ID>",  // teamId
    "<MEMBERSHIP_ID>"  // membershipId
)`,
		roleCheck: `val response = teams.listMemberships("<TEAM_ID>")

val userMembership = response.memberships.find {
    it.userId == "<CURRENT_USER_ID>"
}

if (userMembership == null || !userMembership.roles.contains("admin")) {
    throw Exception("Insufficient permissions")
}`
	},
	apple: {
		avoidUserPermissions: `// DON'T do this for multi-tenant apps
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let tablesDB = TablesDB(client)

let row = try await tablesDB.createRow(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    rowId: "<ROW_ID>",
    data: ["title": "My Row"],
    permissions: [
        Permission.read(Role.user("<USER_ID>")),
        Permission.write(Role.user("<USER_ID>"))
    ]
)`,
		preferTeamPermissions: `// DO this for multi-tenant apps
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let tablesDB = TablesDB(client)

let row = try await tablesDB.createRow(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    rowId: "<ROW_ID>",
    data: ["title": "My Row"],
    permissions: [
        Permission.read(Role.team("<TEAM_ID>", "owner")),
        Permission.read(Role.team("<TEAM_ID>", "admin")),
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "owner")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner"))
    ]
)`,
		createTeam: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let teams = Teams(client)

// Create a team when a new tenant/organization signs up
let team = try await teams.create(
    teamId: "<TEAM_ID>",
    name: "<TEAM_NAME>",
    roles: ["owner", "admin", "member"]  // optional
)`,
		createMembershipEmail: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let teams = Teams(client)

// Send team invitation (email-based)
let membership = try await teams.createMembership(
    teamId: "<TEAM_ID>",
    roles: ["admin", "member"],
    email: "user@example.com",
    url: "https://yourapp.com/accept-invite"
)`,
		createMembershipUserId: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let teams = Teams(client)

// Or invite by user ID (if user already exists)
let membership = try await teams.createMembership(
    teamId: "<TEAM_ID>",
    roles: ["admin", "member"],
    userId: "<USER_ID>"
)`,
		listMemberships: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let teams = Teams(client)

// Get all members of a team
let response = try await teams.listMemberships(
    teamId: "<TEAM_ID>"
)

// Access member data
for membership in response.memberships {
    print(membership.userId)
    print(membership.roles)  // Array of role strings
    print(membership.userName ?? "")
    print(membership.userEmail ?? "")
}`,
		updateMembership: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let teams = Teams(client)

// Update a member's roles (only team owners/admins can do this)
let membership = try await teams.updateMembership(
    teamId: "<TEAM_ID>",
    membershipId: "<MEMBERSHIP_ID>",
    roles: ["admin", "member"]
)`,
		deleteMembership: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let teams = Teams(client)

// Remove a member from a team
try await teams.deleteMembership(
    teamId: "<TEAM_ID>",
    membershipId: "<MEMBERSHIP_ID>"
)`,
		listTeams: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let teams = Teams(client)

// List all teams the current user belongs to
let response = try await teams.list()

for team in response.teams {
    print(team.id)
    print(team.name)
}`,
		getUserRole: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let teams = Teams(client)

// Get membership details for current user in a specific team
let response = try await teams.listMemberships(teamId: "<TEAM_ID>")

let userMembership = response.memberships.first { $0.userId == "<CURRENT_USER_ID>" }

if let membership = userMembership {
    print(membership.roles)  // ['owner', 'admin', etc.]
    let hasAdminRole = membership.roles.contains("admin")
}`,
		createRow: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let tablesDB = TablesDB(client)

// Create row with team-based permissions
let row = try await tablesDB.createRow(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    rowId: "<ROW_ID>",
    data: [
        "title": "My Row",
        "teamId": "<TEAM_ID>",  // Always store teamId for querying
    ],
    permissions: [
        Permission.read(Role.team("<TEAM_ID>", "owner")),
        Permission.read(Role.team("<TEAM_ID>", "admin")),
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "owner")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner")),
        Permission.delete(Role.team("<TEAM_ID>", "admin"))
    ]
)`,
		createTable: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setKey("<API_KEY>")  // Server SDK requires API key

let tablesDB = TablesDB(client)

// Create table with team-based permissions
let table = try await tablesDB.createTable(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    name: "<TABLE_NAME>",
    permissions: [
        Permission.create(Role.team("<TEAM_ID>", "member")),
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner"))
    ]
)`,
		listRows: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let tablesDB = TablesDB(client)

// ALWAYS filter by teamId to ensure tenant isolation
let response = try await tablesDB.listRows(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    queries: [
        Query.equal("teamId", "<TEAM_ID>"),  // Critical: filter by team
        Query.orderDesc("$createdAt"),
        Query.limit(25)
    ]
)`,
		createFile: `import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let storage = Storage(client)

// Create file with team-based permissions
let file = try await storage.createFile(
    bucketId: "<BUCKET_ID>",
    fileId: "<FILE_ID>",
    file: fileInput,
    permissions: [
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner"))
    ]
)`,
		teamCreationFlow: `// When user creates account/organization
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let teams = Teams(client)

let team = try await teams.create(
    teamId: ID.unique(),
    name: "Company Name"
)

// Make creator an owner
try await teams.createMembership(
    teamId: team.id,
    roles: ["owner"],
    userId: "<USER_ID>"
)`,
		inviteFlow: `// Owner/admin invites new member
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let teams = Teams(client)

let invite = try await teams.createMembership(
    teamId: "<TEAM_ID>",
    roles: ["member"],  // Default role
    email: "user@example.com",
    url: "https://yourapp.com/accept-invite"
)
// User receives email, clicks link, accepts invitation`,
		memberListUI: `// Display all team members with their roles
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let teams = Teams(client)

let response = try await teams.listMemberships(teamId: "<TEAM_ID>")
// Show list with role badges and action buttons`,
		roleChange: `// Admin/owner changes member role
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let teams = Teams(client)

let membership = try await teams.updateMembership(
    teamId: "<TEAM_ID>",
    membershipId: "<MEMBERSHIP_ID>",
    roles: ["admin"]
)`,
		memberRemoval: `// Remove member (with confirmation)
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let teams = Teams(client)

try await teams.deleteMembership(
    teamId: "<TEAM_ID>",
    membershipId: "<MEMBERSHIP_ID>"
)`,
		roleCheck: `let response = try await teams.listMemberships(teamId: "<TEAM_ID>")

let userMembership = response.memberships.first { $0.userId == "<CURRENT_USER_ID>" }

if userMembership == nil || !userMembership!.roles.contains("admin") {
    throw NSError(domain: "Appwrite", code: 403, userInfo: [NSLocalizedDescriptionKey: "Insufficient permissions"])
}`
	},
	android: {
		avoidUserPermissions: `// DON'T do this for multi-tenant apps
import io.appwrite.Client
import io.appwrite.services.TablesDB
import io.appwrite.models.Permission
import io.appwrite.models.Role

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val tablesDB = TablesDB(client)

tablesDB.createRow(
    databaseId = "<DATABASE_ID>",
    tableId = "<TABLE_ID>",
    rowId = "<ROW_ID>",
    data = mapOf("title" to "My Row"),
    permissions = listOf(
        Permission.read(Role.user("<USER_ID>")),
        Permission.write(Role.user("<USER_ID>"))
    )
)`,
		preferTeamPermissions: `// DO this for multi-tenant apps
import io.appwrite.Client
import io.appwrite.services.TablesDB
import io.appwrite.models.Permission
import io.appwrite.models.Role

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val tablesDB = TablesDB(client)

tablesDB.createRow(
    databaseId = "<DATABASE_ID>",
    tableId = "<TABLE_ID>",
    rowId = "<ROW_ID>",
    data = mapOf("title" to "My Row"),
    permissions = listOf(
        Permission.read(Role.team("<TEAM_ID>", "owner")),
        Permission.read(Role.team("<TEAM_ID>", "admin")),
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "owner")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner"))
    )
)`,
		createTeam: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val teams = Teams(client)

// Create a team when a new tenant/organization signs up
teams.create(
    "<TEAM_ID>",  // teamId
    "<TEAM_NAME>",  // name
    listOf("owner", "admin", "member")  // roles (optional)
)`,
		createMembershipEmail: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val teams = Teams(client)

// Send team invitation (email-based)
teams.createMembership(
    "<TEAM_ID>",  // teamId
    listOf("admin", "member"),  // roles
    "user@example.com",  // email
    null,  // userId (optional)
    null,  // phone (optional)
    "https://yourapp.com/accept-invite",  // url
    null  // name (optional)
)`,
		createMembershipUserId: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val teams = Teams(client)

// Or invite by user ID (if user already exists)
teams.createMembership(
    "<TEAM_ID>",  // teamId
    listOf("admin", "member"),  // roles
    null,  // email
    "<USER_ID>",  // userId
    null,  // phone
    null,  // url
    null  // name
)`,
		listMemberships: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val teams = Teams(client)

// Get all members of a team
val response = teams.listMemberships(
    "<TEAM_ID>",  // teamId
    listOf(),  // queries (optional)
    null  // search (optional)
)

// Access member data
response.memberships.forEach { membership ->
    Log.d("Appwrite", membership.userId)
    Log.d("Appwrite", membership.roles.toString())  // Array of role strings
    Log.d("Appwrite", membership.userName ?: "")
    Log.d("Appwrite", membership.userEmail ?: "")
}`,
		updateMembership: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val teams = Teams(client)

// Update a member's roles (only team owners/admins can do this)
teams.updateMembership(
    "<TEAM_ID>",  // teamId
    "<MEMBERSHIP_ID>",  // membershipId
    listOf("admin", "member")  // roles
)`,
		deleteMembership: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val teams = Teams(client)

// Remove a member from a team
teams.deleteMembership(
    "<TEAM_ID>",  // teamId
    "<MEMBERSHIP_ID>"  // membershipId
)`,
		listTeams: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val teams = Teams(client)

// List all teams the current user belongs to
val response = teams.list(
    listOf(),  // queries (optional)
    null  // search (optional)
)

response.teams.forEach { team ->
    Log.d("Appwrite", team.id)
    Log.d("Appwrite", team.name)
}`,
		getUserRole: `import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val teams = Teams(client)

// Get membership details for current user in a specific team
val response = teams.listMemberships("<TEAM_ID>")

val userMembership = response.memberships.find {
    it.userId == "<CURRENT_USER_ID>"
}

if (userMembership != null) {
    Log.d("Appwrite", userMembership.roles.toString())  // ['owner', 'admin', etc.]
    val hasAdminRole = userMembership.roles.contains("admin")
}`,
		createRow: `import io.appwrite.Client
import io.appwrite.services.TablesDB
import io.appwrite.models.Permission
import io.appwrite.models.Role

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val tablesDB = TablesDB(client)

// Create row with team-based permissions
tablesDB.createRow(
    databaseId = "<DATABASE_ID>",
    tableId = "<TABLE_ID>",
    rowId = "<ROW_ID>",
    data = mapOf(
        "title" to "My Row",
        "teamId" to "<TEAM_ID>",  // Always store teamId for querying
    ),
    permissions = listOf(
        Permission.read(Role.team("<TEAM_ID>", "owner")),
        Permission.read(Role.team("<TEAM_ID>", "admin")),
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "owner")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner")),
        Permission.delete(Role.team("<TEAM_ID>", "admin"))
    )
)`,
		createTable: `import io.appwrite.Client
import io.appwrite.services.TablesDB
import io.appwrite.models.Permission
import io.appwrite.models.Role

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setKey("<API_KEY>")  // Server SDK requires API key

val tablesDB = TablesDB(client)

// Create table with team-based permissions
tablesDB.createTable(
    databaseId = "<DATABASE_ID>",
    tableId = "<TABLE_ID>",
    name = "<TABLE_NAME>",
    permissions = listOf(
        Permission.create(Role.team("<TEAM_ID>", "member")),
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner"))
    )
)`,
		listRows: `import io.appwrite.Client
import io.appwrite.services.TablesDB
import io.appwrite.Query

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val tablesDB = TablesDB(client)

// ALWAYS filter by teamId to ensure tenant isolation
val response = tablesDB.listRows(
    databaseId = "<DATABASE_ID>",
    tableId = "<TABLE_ID>",
    queries = listOf(
        Query.equal("teamId", "<TEAM_ID>"),  // Critical: filter by team
        Query.orderDesc("$createdAt"),
        Query.limit(25)
    )
)`,
		createFile: `import io.appwrite.Client
import io.appwrite.services.Storage
import io.appwrite.models.Permission
import io.appwrite.models.Role

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val storage = Storage(client)

// Create file with team-based permissions
storage.createFile(
    bucketId = "<BUCKET_ID>",
    fileId = "<FILE_ID>",
    file = fileInput,
    permissions = listOf(
        Permission.read(Role.team("<TEAM_ID>", "member")),
        Permission.update(Role.team("<TEAM_ID>", "admin")),
        Permission.delete(Role.team("<TEAM_ID>", "owner"))
    )
)`,
		teamCreationFlow: `// When user creates account/organization
import io.appwrite.Client
import io.appwrite.services.Teams
import io.appwrite.ID

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val teams = Teams(client)

val team = teams.create(
    ID.unique(),
    "Company Name"
)

// Make creator an owner
teams.createMembership(
    team.id,  // teamId
    listOf("owner"),  // roles
    null,  // email
    "<USER_ID>",  // userId
    null,  // phone
    null,  // url
    null  // name
)`,
		inviteFlow: `// Owner/admin invites new member
import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val teams = Teams(client)

teams.createMembership(
    "<TEAM_ID>",  // teamId
    listOf("member"),  // Default role
    "user@example.com",  // email
    null,  // userId
    null,  // phone
    "https://yourapp.com/accept-invite",  // url
    null  // name
)
// User receives email, clicks link, accepts invitation`,
		memberListUI: `// Display all team members with their roles
import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val teams = Teams(client)

val response = teams.listMemberships("<TEAM_ID>")
// Show list with role badges and action buttons`,
		roleChange: `// Admin/owner changes member role
import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val teams = Teams(client)

teams.updateMembership(
    "<TEAM_ID>",  // teamId
    "<MEMBERSHIP_ID>",  // membershipId
    listOf("admin")  // roles
)`,
		memberRemoval: `// Remove member (with confirmation)
import io.appwrite.Client
import io.appwrite.services.Teams

val client = Client(context)
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val teams = Teams(client)

teams.deleteMembership(
    "<TEAM_ID>",  // teamId
    "<MEMBERSHIP_ID>"  // membershipId
)`,
		roleCheck: `val response = teams.listMemberships("<TEAM_ID>")

val userMembership = response.memberships.find {
    it.userId == "<CURRENT_USER_ID>"
}

if (userMembership == null || !userMembership.roles.contains("admin")) {
    throw Exception("Insufficient permissions")
}`
	},
	flutter: {
		avoidUserPermissions: `// DON'T do this for multi-tenant apps
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final tablesDB = TablesDB(client);

final row = await tablesDB.createRow(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    rowId: '<ROW_ID>',
    data: {'title': 'My Row'},
    permissions: [
        Permission.read(Role.user('<USER_ID>')),
        Permission.write(Role.user('<USER_ID>'))
    ]
);`,
		preferTeamPermissions: `// DO this for multi-tenant apps
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final tablesDB = TablesDB(client);

final row = await tablesDB.createRow(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    rowId: '<ROW_ID>',
    data: {'title': 'My Row'},
    permissions: [
        Permission.read(Role.team('<TEAM_ID>', 'owner')),
        Permission.read(Role.team('<TEAM_ID>', 'admin')),
        Permission.read(Role.team('<TEAM_ID>', 'member')),
        Permission.update(Role.team('<TEAM_ID>', 'owner')),
        Permission.update(Role.team('<TEAM_ID>', 'admin')),
        Permission.delete(Role.team('<TEAM_ID>', 'owner'))
    ]
);`,
		createTeam: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// Create a team when a new tenant/organization signs up
final team = await teams.create(
    teamId: '<TEAM_ID>',
    name: '<TEAM_NAME>',
    roles: ['owner', 'admin', 'member']  // optional
);`,
		createMembershipEmail: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// Send team invitation (email-based)
final invite = await teams.createMembership(
    teamId: '<TEAM_ID>',
    roles: ['admin', 'member'],
    email: 'user@example.com',
    url: 'https://yourapp.com/accept-invite'
);`,
		createMembershipUserId: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// Or invite by user ID (if user already exists)
final membership = await teams.createMembership(
    teamId: '<TEAM_ID>',
    roles: ['admin', 'member'],
    userId: '<USER_ID>'
);`,
		listMemberships: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// Get all members of a team
final response = await teams.listMemberships(teamId: '<TEAM_ID>');

// Access member data
for (final membership in response.memberships) {
    print(membership.userId);
    print(membership.roles);  // Array of role strings
    print(membership.userName);
    print(membership.userEmail);
}`,
		updateMembership: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// Update a member's roles (only team owners/admins can do this)
await teams.updateMembership(
    teamId: '<TEAM_ID>',
    membershipId: '<MEMBERSHIP_ID>',
    roles: ['admin', 'member']
);`,
		deleteMembership: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// Remove a member from a team
await teams.deleteMembership(
    teamId: '<TEAM_ID>',
    membershipId: '<MEMBERSHIP_ID>'
);`,
		listTeams: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// List all teams the current user belongs to
final response = await teams.list();

for (final team in response.teams) {
    print(team.id);
    print(team.name);
}`,
		getUserRole: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// Get membership details for current user in a specific team
final response = await teams.listMemberships(teamId: '<TEAM_ID>');

final userMembership = response.memberships.firstWhere(
    (m) => m.userId == '<CURRENT_USER_ID>',
    orElse: () => null,
);

if (userMembership != null) {
    print(userMembership.roles);  // ['owner', 'admin', etc.]
    final hasAdminRole = userMembership.roles.contains('admin');
}`,
		createRow: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final tablesDB = TablesDB(client);

// Create row with team-based permissions
final row = await tablesDB.createRow(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    rowId: '<ROW_ID>',
    data: {
        'title': 'My Row',
        'teamId': '<TEAM_ID>',  // Always store teamId for querying
    },
    permissions: [
        Permission.read(Role.team('<TEAM_ID>', 'owner')),
        Permission.read(Role.team('<TEAM_ID>', 'admin')),
        Permission.read(Role.team('<TEAM_ID>', 'member')),
        Permission.update(Role.team('<TEAM_ID>', 'owner')),
        Permission.update(Role.team('<TEAM_ID>', 'admin')),
        Permission.delete(Role.team('<TEAM_ID>', 'owner')),
        Permission.delete(Role.team('<TEAM_ID>', 'admin'))
    ]
);`,
		createTable: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>')
    .setKey('<API_KEY>');  // Server SDK requires API key

final tablesDB = TablesDB(client);

// Create table with team-based permissions
final table = await tablesDB.createTable(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    name: '<TABLE_NAME>',
    permissions: [
        Permission.create(Role.team('<TEAM_ID>', 'member')),
        Permission.read(Role.team('<TEAM_ID>', 'member')),
        Permission.update(Role.team('<TEAM_ID>', 'admin')),
        Permission.delete(Role.team('<TEAM_ID>', 'owner'))
    ]
);`,
		listRows: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final tablesDB = TablesDB(client);

// ALWAYS filter by teamId to ensure tenant isolation
final response = await tablesDB.listRows(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    queries: [
        Query.equal('teamId', '<TEAM_ID>'),  // Critical: filter by team
        Query.orderDesc('\$createdAt'),
        Query.limit(25)
    ]
);`,
		createFile: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final storage = Storage(client);

// Create file with team-based permissions
final file = await storage.createFile(
    bucketId: '<BUCKET_ID>',
    fileId: '<FILE_ID>',
    file: fileInput,
    permissions: [
        Permission.read(Role.team('<TEAM_ID>', 'member')),
        Permission.update(Role.team('<TEAM_ID>', 'admin')),
        Permission.delete(Role.team('<TEAM_ID>', 'owner'))
    ]
);`,
		teamCreationFlow: `// When user creates account/organization
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

final team = await teams.create(
    teamId: ID.unique(),
    name: 'Company Name'
);

// Make creator an owner
await teams.createMembership(
    teamId: team.id,
    roles: ['owner'],
    userId: '<USER_ID>'
);`,
		inviteFlow: `// Owner/admin invites new member
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

final invite = await teams.createMembership(
    teamId: '<TEAM_ID>',
    roles: ['member'],  // Default role
    email: 'user@example.com',
    url: 'https://yourapp.com/accept-invite'
);
// User receives email, clicks link, accepts invitation`,
		memberListUI: `// Display all team members with their roles
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

final response = await teams.listMemberships(teamId: '<TEAM_ID>');
// Show list with role badges and action buttons`,
		roleChange: `// Admin/owner changes member role
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

await teams.updateMembership(
    teamId: '<TEAM_ID>',
    membershipId: '<MEMBERSHIP_ID>',
    roles: ['admin']
);`,
		memberRemoval: `// Remove member (with confirmation)
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

await teams.deleteMembership(
    teamId: '<TEAM_ID>',
    membershipId: '<MEMBERSHIP_ID>'
);`,
		roleCheck: `final response = await teams.listMemberships(teamId: '<TEAM_ID>');

final userMembership = response.memberships.firstWhere(
    (m) => m.userId == '<CURRENT_USER_ID>',
    orElse: () => null,
);

if (userMembership == null || !userMembership.roles.contains('admin')) {
    throw Exception('Insufficient permissions');
}`
	},
	dart: {
		// Dart uses the same syntax as Flutter
		avoidUserPermissions: `// DON'T do this for multi-tenant apps
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final tablesDB = TablesDB(client);

final row = await tablesDB.createRow(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    rowId: '<ROW_ID>',
    data: {'title': 'My Row'},
    permissions: [
        Permission.read(Role.user('<USER_ID>')),
        Permission.write(Role.user('<USER_ID>'))
    ]
);`,
		preferTeamPermissions: `// DO this for multi-tenant apps
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final tablesDB = TablesDB(client);

final row = await tablesDB.createRow(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    rowId: '<ROW_ID>',
    data: {'title': 'My Row'},
    permissions: [
        Permission.read(Role.team('<TEAM_ID>', 'owner')),
        Permission.read(Role.team('<TEAM_ID>', 'admin')),
        Permission.read(Role.team('<TEAM_ID>', 'member')),
        Permission.update(Role.team('<TEAM_ID>', 'owner')),
        Permission.update(Role.team('<TEAM_ID>', 'admin')),
        Permission.delete(Role.team('<TEAM_ID>', 'owner'))
    ]
);`,
		createTeam: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// Create a team when a new tenant/organization signs up
final team = await teams.create(
    teamId: '<TEAM_ID>',
    name: '<TEAM_NAME>',
    roles: ['owner', 'admin', 'member']  // optional
);`,
		createMembershipEmail: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// Send team invitation (email-based)
final invite = await teams.createMembership(
    teamId: '<TEAM_ID>',
    roles: ['admin', 'member'],
    email: 'user@example.com',
    url: 'https://yourapp.com/accept-invite'
);`,
		createMembershipUserId: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// Or invite by user ID (if user already exists)
final membership = await teams.createMembership(
    teamId: '<TEAM_ID>',
    roles: ['admin', 'member'],
    userId: '<USER_ID>'
);`,
		listMemberships: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// Get all members of a team
final response = await teams.listMemberships(teamId: '<TEAM_ID>');

// Access member data
for (final membership in response.memberships) {
    print(membership.userId);
    print(membership.roles);  // Array of role strings
    print(membership.userName);
    print(membership.userEmail);
}`,
		updateMembership: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// Update a member's roles (only team owners/admins can do this)
await teams.updateMembership(
    teamId: '<TEAM_ID>',
    membershipId: '<MEMBERSHIP_ID>',
    roles: ['admin', 'member']
);`,
		deleteMembership: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// Remove a member from a team
await teams.deleteMembership(
    teamId: '<TEAM_ID>',
    membershipId: '<MEMBERSHIP_ID>'
);`,
		listTeams: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// List all teams the current user belongs to
final response = await teams.list();

for (final team in response.teams) {
    print(team.id);
    print(team.name);
}`,
		getUserRole: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

// Get membership details for current user in a specific team
final response = await teams.listMemberships(teamId: '<TEAM_ID>');

final userMembership = response.memberships.firstWhere(
    (m) => m.userId == '<CURRENT_USER_ID>',
    orElse: () => null,
);

if (userMembership != null) {
    print(userMembership.roles);  // ['owner', 'admin', etc.]
    final hasAdminRole = userMembership.roles.contains('admin');
}`,
		createRow: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final tablesDB = TablesDB(client);

// Create row with team-based permissions
final row = await tablesDB.createRow(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    rowId: '<ROW_ID>',
    data: {
        'title': 'My Row',
        'teamId': '<TEAM_ID>',  // Always store teamId for querying
    },
    permissions: [
        Permission.read(Role.team('<TEAM_ID>', 'owner')),
        Permission.read(Role.team('<TEAM_ID>', 'admin')),
        Permission.read(Role.team('<TEAM_ID>', 'member')),
        Permission.update(Role.team('<TEAM_ID>', 'owner')),
        Permission.update(Role.team('<TEAM_ID>', 'admin')),
        Permission.delete(Role.team('<TEAM_ID>', 'owner')),
        Permission.delete(Role.team('<TEAM_ID>', 'admin'))
    ]
);`,
		createTable: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>')
    .setKey('<API_KEY>');  // Server SDK requires API key

final tablesDB = TablesDB(client);

// Create table with team-based permissions
final table = await tablesDB.createTable(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    name: '<TABLE_NAME>',
    permissions: [
        Permission.create(Role.team('<TEAM_ID>', 'member')),
        Permission.read(Role.team('<TEAM_ID>', 'member')),
        Permission.update(Role.team('<TEAM_ID>', 'admin')),
        Permission.delete(Role.team('<TEAM_ID>', 'owner'))
    ]
);`,
		listRows: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final tablesDB = TablesDB(client);

// ALWAYS filter by teamId to ensure tenant isolation
final response = await tablesDB.listRows(
    databaseId: '<DATABASE_ID>',
    tableId: '<TABLE_ID>',
    queries: [
        Query.equal('teamId', '<TEAM_ID>'),  // Critical: filter by team
        Query.orderDesc('\$createdAt'),
        Query.limit(25)
    ]
);`,
		createFile: `import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final storage = Storage(client);

// Create file with team-based permissions
final file = await storage.createFile(
    bucketId: '<BUCKET_ID>',
    fileId: '<FILE_ID>',
    file: fileInput,
    permissions: [
        Permission.read(Role.team('<TEAM_ID>', 'member')),
        Permission.update(Role.team('<TEAM_ID>', 'admin')),
        Permission.delete(Role.team('<TEAM_ID>', 'owner'))
    ]
);`,
		teamCreationFlow: `// When user creates account/organization
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

final team = await teams.create(
    teamId: ID.unique(),
    name: 'Company Name'
);

// Make creator an owner
await teams.createMembership(
    teamId: team.id,
    roles: ['owner'],
    userId: '<USER_ID>'
);`,
		inviteFlow: `// Owner/admin invites new member
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

final invite = await teams.createMembership(
    teamId: '<TEAM_ID>',
    roles: ['member'],  // Default role
    email: 'user@example.com',
    url: 'https://yourapp.com/accept-invite'
);
// User receives email, clicks link, accepts invitation`,
		memberListUI: `// Display all team members with their roles
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

final response = await teams.listMemberships(teamId: '<TEAM_ID>');
// Show list with role badges and action buttons`,
		roleChange: `// Admin/owner changes member role
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

await teams.updateMembership(
    teamId: '<TEAM_ID>',
    membershipId: '<MEMBERSHIP_ID>',
    roles: ['admin']
);`,
		memberRemoval: `// Remove member (with confirmation)
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final teams = Teams(client);

await teams.deleteMembership(
    teamId: '<TEAM_ID>',
    membershipId: '<MEMBERSHIP_ID>'
);`,
		roleCheck: `final response = await teams.listMemberships(teamId: '<TEAM_ID>');

final userMembership = response.memberships.firstWhere(
    (m) => m.userId == '<CURRENT_USER_ID>',
    orElse: () => null,
);

if (userMembership == null || !userMembership.roles.contains('admin')) {
    throw Exception('Insufficient permissions');
}`
	}
};

/**
 * Get permission examples for a specific SDK
 * @param {string} sdk - The SDK name (javascript, python, php, go, etc.)
 * @returns {Object} Permission examples for the SDK
 */
export function getPermissionExamples(sdk) {
	// Map SDK names to their examples
	/** @type {Record<string, typeof permissionExamples.javascript>} */
	const sdkMap = {
		javascript: permissionExamples.javascript,
		'react-native': permissionExamples['react-native'],
		python: permissionExamples.python,
		php: permissionExamples.php,
		go: permissionExamples.go,
		ruby: permissionExamples.ruby,
		dotnet: permissionExamples.dotnet,
		swift: permissionExamples.swift,
		kotlin: permissionExamples.kotlin,
		apple: permissionExamples.apple,
		android: permissionExamples.android,
		flutter: permissionExamples.flutter,
		dart: permissionExamples.dart
	};

	return sdkMap[sdk] || permissionExamples.javascript; // Default to JavaScript
}

