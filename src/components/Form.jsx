/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import styles from "./Form.module.css";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Message from "./Message";
import Spinner from "./Spinner";
import { useCities } from "../contexts/CitiesContext";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "./Loader";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  const navigate = useNavigate();
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [lat, lng] = useUrlPosition();
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emoji, setEmoji] = useState("");
  const { createCity, isLoading } = useCities();

  const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

  useEffect(() => {
    if (!lat && !lng) return;
    async function fetchCityData() {
      try {
        setIsLoadingGeocoding(true);
        setGeocodingError("");
        const res = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lng}`);
        const data = await res.json();
        if (!data.countryCode)
          throw new Error(
            "That doesn't seem to be a city. Click somewhere else 🤔"
          );
        setCityName(data.city || data.locality || "");
        setCountry(data.countryName);
        setEmoji(convertToEmoji(data.countryCode));
      } catch (err) {
        setGeocodingError(err.message);
      } finally {
        setIsLoadingGeocoding(false);
      }
    }
    fetchCityData();
  }, [lat, lng]);

  async function handleSubmitForm(e) {
    setLoading(true);
    e.preventDefault();
    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };

    const token = JSON.parse(localStorage.getItem("worldwise-user")).token;

    const { data } = await axios.post(
      `${import.meta.env.VITE_APP_URL}/places/create`,
      newCity,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    if (data.error) return toast.error(data.error);
    setLoading(false);
    toast.success(data.message);
    navigate("/app");
  }

  if (isLoadingGeocoding) return <Spinner />;

  if (!lat && !lng) return <Message message="Start by clicking on the map" />;

  if (geocodingError) return <Message message={geocodingError} />;

  return (
    <form
      onSubmit={handleSubmitForm}
      className={`${styles.form} ${isLoading ? styles.loading : ""} `}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <DatePicker
          id="date"
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button disabled={loading} type="primary">
          {loading ? <Loader /> : "Add"}
        </Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
