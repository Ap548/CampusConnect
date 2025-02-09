import { supabase } from "@/Clients/supabaseClient";
import { SessionManager } from "@/Manager/sessionManager";

/**
 * Richtiges Echtzeit-Setup 
 * @param {Object} store - Snackbar Store für Benachrichtigungen
 * @param {Function} updateFahrten - Funktion zum Aktualisieren der Fahrtenliste
 */
export default async function setupRealtime(store, router, updateFahrten) {
  try {
    const user = await SessionManager.getUser();
    if (!user) {
      console.warn("Kein Benutzer gefunden.");
      return;
    }

    // Echtzeit-Updates für Fahrten (Hinzufügen/Löschen)
    supabase
      .channel("fahrten-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fahrten" },
        (payload) => {
          console.log("Fahrten-Update erhalten:", payload);
          updateFahrten(); // Aktualisiert die Fahrtenliste in Home.vue
        }
      )
      .subscribe();

    // Echtzeit-Updates für neue Anfragen (nur für Fahrt-Ersteller)
    supabase
    .channel("new_request")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "anfragen" },
      (payload) => {
        const { created_by } = payload.new;

        if (user.username === created_by) { // Überprüft, ob der aktuelle User der Fahrt-Ersteller ist
          store.showSnackbar({
            message: "Eine neue Anfrage liegt vor!",
            color: "info",
            action: () => {
              router.push({
                name: "/AnfragenVerwaltung",
                
              });
            },
          });

        }
      }
    )
    .subscribe();




    // Echtzeit-Updates für Statusänderungen (nur für den Anfragenden)
    supabase
    .channel("status_update")
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "anfragen" },
    (payload) => {
      const { anfrager, status, start, ziel } = payload.new;
      const previousStatus = payload.old?.status; // Vorheriger Status auslesen

      // Snackbar nur anzeigen, wenn der vorherige Status NICHT identisch mit dem neuen ist
      if (user.username === anfrager && previousStatus !== status) {
        if (status === "akzeptiert" || status === "abgelehnt") {
          const message =
            status === "akzeptiert"
              ? "Deine Anfrage wurde angenommen!"
              : "Deine Anfrage wurde abgelehnt.";

          const color = status === "akzeptiert" ? "success" : "error";

          store.showSnackbar({
            message,
            color,
            action: () => {
              if (status === "abgelehnt") {
                router.push({
                  name: "AlternativeFahrten",
                  query: { start, ziel },
                });
              } else{
                router.push({
                  name: "Anfragenverwaltung",
                  
                });
              }
            },
          });
        }
      }
    }
  )
  .subscribe();


 // Echtzeit-Updates für Einladungen
 supabase
 .channel("invitations")
 .on(
   "postgres_changes",
   { event: "INSERT", schema: "public", table: "fahrten" },
   (payload) => {
     const { inviteUser, created_by, id_fahrt } = payload.new;
     if (inviteUser && inviteUser.includes(user.username)) {
       // Überprüfen, ob der aktuelle Benutzer eingeladen wurde
       store.showSnackbar({
         message: `Du wurdest von ${created_by} eingeladen!`,
         color: "info",
         action: () => {
           router.push({
             name: "Profil",
             params: { username: created_by },
             query: { highlightedFahrt: id_fahrt },
           });
         },
       });
     }
   }
 )
 .subscribe();
} catch (error) {
  console.error("Fehler beim Abrufen des Benutzers:", error);
}
}



/**
 * Sendet eine Benachrichtigung über den Status der Anfrage
 * @param {number} anfrageId - Die ID der Anfrage
 * @param {string} status - Neuer Status (angenommen/abgelehnt)
 */
export async function sendNotification(anfrageId, status) {
  const { error } = await supabase
    .from("anfragen")
    .update({ status })
    .eq("id_anfrage", anfrageId);

  if (error) {
    console.error("Fehler beim Senden der Benachrichtigung:", error);
  }
}
