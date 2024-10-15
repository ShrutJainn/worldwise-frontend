import { Link, useNavigate } from "react-router-dom";
import PageNav from "../components/PageNav";
import styles from "./Login.module.css";
import { useState } from "react";
import Button from "../components/Button";
import axios from "axios";
import toast from "react-hot-toast";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import Loader from "../components/Loader";

export default function Login() {
  // PRE-FILL FOR DEV PURPOSES
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setUser = useSetRecoilState(userAtom);

  const url = import.meta.env.VITE_APP_URL;
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      const { data } = await axios.post(url + "/users/login", {
        username,
        password,
      });
      const { user, token } = data;
      localStorage.setItem("worldwise-user", JSON.stringify({ user, token }));
      setUser(data.user);
      toast.success(data.message);
      navigate("/app", { replace: true });
    } catch (error) {
      if (error.response.data.error) {
        toast.error(error.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.login}>
      <PageNav />
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <label htmlFor="email">Username</label>
          <input
            disabled={loading}
            placeholder="Username"
            type="username"
            id="username"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
        </div>

        <div className={styles.row}>
          <label htmlFor="password">Password</label>
          <input
            disabled={loading}
            placeholder="Password"
            type="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>

        <div>
          <Button type="primary" disabled={loading}>
            {loading ? <Loader /> : "Login"}
          </Button>
        </div>
        <div>
          <p style={{ fontSize: "medium" }}>
            Not a user?{" "}
            <Link
              to="/signup"
              style={{
                textDecoration: "none",
                color: "white",
              }}
            >
              Signup
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
