const formatNumbersOnly = value => (value.match(/[0-9]/g) || []).join('')

export default formatNumbersOnly
