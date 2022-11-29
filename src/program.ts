import StartUp from "./startUp"

const port = process.env.PORT

StartUp.app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})
