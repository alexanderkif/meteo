
module.exports = async (req, res) => {
  res.status(200).json({'api': '/data?start=START_DATE&finish=FINISH_DATE'})
}
