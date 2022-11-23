import StartUp from "./startUp"

const port = "5000"

StartUp.app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})
