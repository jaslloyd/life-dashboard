import React from 'react'
import { Tile } from './Tile'
import './Login.css'

const Login: React.FC<{ onSubmit: (code: string) => void }> = ({
  onSubmit,
}) => {
  const [code, setCode] = React.useState('')

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    console.log(e)
    onSubmit(code)
  }
  return (
    <Tile title="Please Login">
      <form onSubmit={handleFormSubmit}>
        <label htmlFor="code" hidden>
          Code
        </label>
        <input
          type="password"
          id="code"
          onChange={(e) => setCode(e.target.value)}
          value={code}
          placeholder="Login Code"
        />
        <button type="submit">Login</button>
      </form>
    </Tile>
  )
}

export default Login
