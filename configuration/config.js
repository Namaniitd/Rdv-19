module.exports={
  "facebook_api_key"      :     process.env.API_KEY,
  "facebook_api_secret"   :     process.env.API_SECRET,
  "callback_url"          :     process.env.CALLBACK_URL,
  "use_database"          :     "true",
  "host"                  :     process.env.RDS_HOSTNAME,
  "username"              :     process.env.RDS_USERNAME,
  "password"              :     process.env.RDS_PASSWORD,
  "database"              :     process.env.RDS_DB_NAME
}