const oneDigit = /^(?=.*\d)/
const oneUpperCase = /^(?=.*[A-Z])/
const oneSpecialCharacter = /[^a-zA-Z0-9]/

export default function isValidPassword(value) {
  if (!value) {
    return false
  }
  return (
    oneDigit.test(value) &&
    oneUpperCase.test(value) &&
    oneSpecialCharacter.test(value) &&
    value.length > 7 &&
    value.length < 36
  )
}
