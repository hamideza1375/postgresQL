import nodeCache from "node-cache"
const cache = new nodeCache({ stdTTL: 180, checkperiod: 181 })

export default cache