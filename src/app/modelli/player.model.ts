export interface Player {
    id_player: number,
    nome: string,
    cognome: string,
    data_nascita: Date,
    ruolo: "ruolo_1" | "ruolo_2" | "ruolo_3",
    peso: number,
    altezza: number,
    id_team: number
}