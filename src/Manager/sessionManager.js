
//SessionManager mit Punktnotation verwenden z.B: await SessionManager.funktion()


import { supabase } from "@/Clients/supabaseClient";

export const SessionManager = {
  // Abrufen der aktuellen Sitzung
  async getCurrentSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Fehler beim Abrufen der aktuellen Sitzung:", error);
        return null;
      }
      return data.session;
    } catch (err) {
      console.error("Unerwarteter Fehler beim Abrufen der Sitzung:", err);
      return null;
    }
  },

  // Abrufen des aktuellen Benutzers
  async getUser() {
    try {
      const session = await this.getCurrentSession();
      if (!session?.user) {
        console.error("Keine aktive Sitzung gefunden oder Benutzer ist nicht eingeloggt.");
        return null;
      }

      // Benutzerinformationen aus der Sitzung
      const user = session.user;

      // Metadaten abrufen, Benutzernamen
      const username = user.user_metadata?.username || "Unbekannt";

      return {
        id: user.id,
        email: user.email,
        username: username,
        created_at: user.created_at, // Datum der Kontoerstellung (optional)
      };
    } catch (err) {
      console.error("Fehler beim Abrufen des Benutzers:", err);
      return null;
    }
  },

  // Benutzeranmeldung
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Fehler bei der Anmeldung:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err) {
      console.error("Unerwarteter Fehler bei der Anmeldung:", err);
      return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." };
    }
  },

  // Benutzerabmeldung
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Fehler beim Abmelden:", error.message);
        return { success: false, error: error.message };
      }
       // Clear local storage
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');

      // Clear cookies (if you are using them)
      document.cookie = "sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      return { success: true };
    } catch (err) {
      console.error("Unerwarteter Fehler bei der Abmeldung:", err);
      return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." };
    }
  },
};
