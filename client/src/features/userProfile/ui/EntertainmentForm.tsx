import React, { useState } from "react";
import { ShieldAlert, Plus, X } from "lucide-react";
import type { Entertainment } from "@/entities/userProfile/model/types";
import { MSG_FAILED_SUBMIT_FORM } from "@/shared/constants/messages";

interface EntertainmentFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  initialValues?: Entertainment;
}

export const EntertainmentForm: React.FC<EntertainmentFormProps> = ({
  onSubmit,
  onClose,
  initialValues,
}) => {
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(
    initialValues?.favoriteGenres || []
  );
  const [newGenre, setNewGenre] = useState("");

  const [streamingServices, setStreamingServices] = useState<string[]>(
    initialValues?.streamingServices || []
  );
  const [newService, setNewService] = useState("");

  const [hobbies, setHobbies] = useState<string[]>(initialValues?.hobbies || []);
  const [newHobby, setNewHobby] = useState("");

  const [weeklyScreenTime, setWeeklyScreenTime] = useState(
    initialValues?.weeklyScreenTime || ""
  );

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddGenre = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGenre.trim() && !favoriteGenres.includes(newGenre.trim())) {
      setFavoriteGenres([...favoriteGenres, newGenre.trim()]);
      setNewGenre("");
    }
  };

  const handleRemoveGenre = (itemToRemove: string) => {
    setFavoriteGenres(favoriteGenres.filter((item) => item !== itemToRemove));
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (newService.trim() && !streamingServices.includes(newService.trim())) {
      setStreamingServices([...streamingServices, newService.trim()]);
      setNewService("");
    }
  };

  const handleRemoveService = (itemToRemove: string) => {
    setStreamingServices(
      streamingServices.filter((item) => item !== itemToRemove)
    );
  };

  const handleAddHobby = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHobby.trim() && !hobbies.includes(newHobby.trim())) {
      setHobbies([...hobbies, newHobby.trim()]);
      setNewHobby("");
    }
  };

  const handleRemoveHobby = (itemToRemove: string) => {
    setHobbies(hobbies.filter((item) => item !== itemToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const finalGenres = [...favoriteGenres];
    const pendingGenre = newGenre.trim().replace(/,$/, "");
    if (pendingGenre && !finalGenres.includes(pendingGenre)) {
      finalGenres.push(pendingGenre);
    }

    const finalServices = [...streamingServices];
    const pendingService = newService.trim().replace(/,$/, "");
    if (pendingService && !finalServices.includes(pendingService)) {
      finalServices.push(pendingService);
    }

    const finalHobbies = [...hobbies];
    const pendingHobby = newHobby.trim().replace(/,$/, "");
    if (pendingHobby && !finalHobbies.includes(pendingHobby)) {
      finalHobbies.push(pendingHobby);
    }

    try {
      const payload = {
        entertainment: {
          favoriteGenres: finalGenres.length > 0 ? finalGenres : undefined,
          streamingServices:
            finalServices.length > 0 ? finalServices : undefined,
          hobbies: finalHobbies.length > 0 ? finalHobbies : undefined,
          weeklyScreenTime: weeklyScreenTime || undefined,
        },
      };

      await onSubmit(payload);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || err.message || MSG_FAILED_SUBMIT_FORM
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formContainerStyles} noValidate>
      {errorMsg && (
        <div style={errorContainerStyles}>
          <ShieldAlert size={18} style={{ marginRight: "0.5rem", flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Screen Time */}
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
          Average Weekly Media / Screen Time
        </label>
        <select
          className="form-input"
          style={inputOverrideStyles}
          value={weeklyScreenTime}
          onChange={(e) => setWeeklyScreenTime(e.target.value)}
        >
          <option value="">Select Screen Time</option>
          <option value="Under 5 hours">Under 5 hours</option>
          <option value="5 - 15 hours">5 - 15 hours</option>
          <option value="15 - 30 hours">15 - 30 hours</option>
          <option value="30+ hours">30+ hours</option>
        </select>
      </div>

      {/* Favorite Genres */}
      <div className="form-group" style={{ marginTop: "1rem" }}>
        <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
          Favorite Movie & Music Genres
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            className="form-input"
            style={inputOverrideStyles}
            placeholder="e.g. Sci-Fi, Jazz, Action, Documentary"
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddGenre(e);
              }
            }}
          />
          <button type="button" onClick={handleAddGenre} style={addBtnStyles}>
            <Plus size={16} /> Add
          </button>
        </div>

        {favoriteGenres.length > 0 && (
          <div style={chipContainerStyles}>
            {favoriteGenres.map((genre) => (
              <span key={genre} style={chipStyles}>
                {genre}
                <X
                  size={14}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemoveGenre(genre)}
                />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Streaming Services */}
      <div className="form-group">
        <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
          Streaming Services Used
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            className="form-input"
            style={inputOverrideStyles}
            placeholder="e.g. Netflix, Spotify, Prime Video, YouTube"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddService(e);
              }
            }}
          />
          <button type="button" onClick={handleAddService} style={addBtnStyles}>
            <Plus size={16} /> Add
          </button>
        </div>

        {streamingServices.length > 0 && (
          <div style={chipContainerStyles}>
            {streamingServices.map((service) => (
              <span key={service} style={chipStyles}>
                {service}
                <X
                  size={14}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemoveService(service)}
                />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hobbies */}
      <div className="form-group">
        <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
          Hobbies & Leisure Activities
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            className="form-input"
            style={inputOverrideStyles}
            placeholder="e.g. Gaming, Reading, Photography, Hiking"
            value={newHobby}
            onChange={(e) => setNewHobby(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddHobby(e);
              }
            }}
          />
          <button type="button" onClick={handleAddHobby} style={addBtnStyles}>
            <Plus size={16} /> Add
          </button>
        </div>

        {hobbies.length > 0 && (
          <div style={chipContainerStyles}>
            {hobbies.map((hobby) => (
              <span key={hobby} style={chipStyles}>
                {hobby}
                <X
                  size={14}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemoveHobby(hobby)}
                />
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={actionsContainerStyles}>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          style={cancelBtnStyles}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={submitBtnStyles}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

const formContainerStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
};

const inputOverrideStyles: React.CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  padding: "0.75rem 1rem",
  fontSize: "0.95rem",
  outline: "none",
  width: "100%",
};

const errorContainerStyles: React.CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: "12px",
  backgroundColor: "#fef2f2",
  border: "1px solid #fee2e2",
  color: "#dc2626",
  fontSize: "0.875rem",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
};

const chipContainerStyles: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.35rem",
  marginTop: "0.75rem",
};

const chipStyles: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  backgroundColor: "#f1f5f9",
  color: "#334155",
  padding: "0.3rem 0.65rem",
  borderRadius: "8px",
  fontSize: "0.85rem",
  fontWeight: 600,
};

const addBtnStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  border: "none",
  borderRadius: "12px",
  padding: "0 1.25rem",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.875rem",
};

const actionsContainerStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "1rem",
  marginTop: "1rem",
  borderTop: "1px solid #e2e8f0",
  paddingTop: "1.25rem",
};

const cancelBtnStyles: React.CSSProperties = {
  padding: "0.625rem 1.25rem",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  backgroundColor: "transparent",
  color: "#475569",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
};

const submitBtnStyles: React.CSSProperties = {
  padding: "0.625rem 1.25rem",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#4f46e5",
  color: "white",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
};
