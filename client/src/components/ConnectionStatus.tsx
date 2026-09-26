import { useEffect, useState } from "react";
import { getHealth } from "../services/healthService";

export function ConnectionStatus() {
  const [message, setMessage] = useState("Проверка подключения…");
  useEffect(() => {
    let active = true;
    getHealth()
      .then((result) => {
        if (active) setMessage(result.message);
      })
      .catch(() => {
        if (active) setMessage("Нет подключения к серверу или SQL Server");
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <p className="connection" role="status">
      {message}
    </p>
  );
}
