export interface Player {
    id_player: string,
    nome: string,
    cognome: string,
    data_nascita: string,
    ruolo: "Playmaker" | "Guardia" | "Ala piccola" | "Ala grande" | "Centro",
    peso: number,
    altezza: number,
    id_team: string
}