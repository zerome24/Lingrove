from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import MachineDirectory
from backend.app.schemas import MachineDirectoryOut

router = APIRouter(prefix="/api/machines", tags=["Machine Directory"])

@router.get("", response_model=List[MachineDirectoryOut])
def list_machines(db: Session = Depends(get_db)):
    return db.query(MachineDirectory).all()

@router.get("/{machine_id}", response_model=MachineDirectoryOut)
def get_machine(machine_id: int, db: Session = Depends(get_db)):
    machine = db.query(MachineDirectory).filter(MachineDirectory.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine
