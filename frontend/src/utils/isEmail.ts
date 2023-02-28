const regex = /^[^ @]+@[-a-zA-Z0-9._]{1,254}\.[a-z]{2,20}$/

const notRegex = /^[A-Za-z]{3,9}:\/\//

const isEmail = (candidateMail: string): boolean => {
  return !notRegex.test(candidateMail) && regex.test(candidateMail)
}

export default isEmail
