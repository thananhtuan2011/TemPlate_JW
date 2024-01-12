export interface RoomTable {
    id: number;
    floorId: number;
    code: string;
    name: string;
    isDesk: boolean;
    numberSeat: number;
    position: number;
    description: string;
    isDeleted: boolean;
    isChoose: boolean;
}
