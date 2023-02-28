import User from '../models/User'
import {closeDb, connectDb} from '../db'

let args = process.argv.slice(2)

const validGroups = ['customer', 'subscriber', 'org_subscriber', 'administrator']

if (args.length !== 4) {
  console.log(`usage: ${process.argv[0]} ${process.argv[1]} <name> <mail> <password> <groups-comma-separated>`)
  console.log(`groups: ${validGroups.join(',')}`)
  process.exit(1)
}

const [name, mail, password, rolesString] = args

const roles = rolesString.split(',')

const unknownRoles = roles.filter(role => !validGroups.includes(role))
if (unknownRoles.length) {
  console.log(`ERROR: these roles are unknown: ${unknownRoles.join(', ')}`)
  process.exit(1)
}

const createUser = async () => {
  const meta = {store: {fieldsOfWork: {student: null, pupil: null, other: null}}}
  try {
    await connectDb()
    await new User({id: name, name, mail, password, roles, meta}).save()
    console.log(`successfully saved user ${name}`)
    await closeDb()
  } catch (e) {
    console.error('Error while saving the user', e)
  }
}

createUser()