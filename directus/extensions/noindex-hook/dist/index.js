// Keeps the CMS out of search engines: its images are linked from the site, so robots.txt
// alone would still let their addresses be indexed. The header says no to every response,
// and robots.txt (ROBOTS_TXT in the compose) lets crawlers read it.
export default ({init}) => {
  init('app.before', ({app}) => {
    app.use((_req, res, next) => {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow')
      next()
    })
  })
}
