import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportContext } from "@/contexts/ReportContext";
import { useDoctors } from "@/hooks/useDoctors";

interface UnpaidExam {
  id?: string;
  patient_first_name: string;
  patient_last_name: string;
  reason: string;
  doctor_id: string | null;
}

export function UnpaidExamsSection() {
  const { currentReport, updateCurrentReport } = useReportContext();
  const { doctors } = useDoctors();

  const unpaidExams: UnpaidExam[] = currentReport.unpaid_exams || [];

  const addUnpaidExam = () => {
    const newExam: UnpaidExam = {
      patient_first_name: "",
      patient_last_name: "",
      reason: "",
      doctor_id: null,
    };

    updateCurrentReport({
      unpaid_exams: [...unpaidExams, newExam],
    });
  };

  const updateUnpaidExam = (index: number, field: keyof UnpaidExam, value: string | null) => {
    const updated = [...unpaidExams];
    updated[index] = { ...updated[index], [field]: value };
    updateCurrentReport({ unpaid_exams: updated });
  };

  const removeUnpaidExam = (index: number) => {
    const updated = unpaidExams.filter((_, i) => i !== index);
    updateCurrentReport({ unpaid_exams: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Nenaplaćeni Pregledi</span>
          <Button onClick={addUnpaidExam} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {unpaidExams.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nema nenaplaćenih pregleda. Kliknite "Dodaj" da dodate novi.
          </p>
        ) : (
          unpaidExams.map((exam, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`first-name-${index}`}>Ime Pacijenta</Label>
                  <Input
                    id={`first-name-${index}`}
                    value={exam.patient_first_name}
                    onChange={(e) =>
                      updateUnpaidExam(index, "patient_first_name", e.target.value)
                    }
                    placeholder="Unesite ime"
                  />
                </div>

                <div>
                  <Label htmlFor={`last-name-${index}`}>Prezime Pacijenta</Label>
                  <Input
                    id={`last-name-${index}`}
                    value={exam.patient_last_name}
                    onChange={(e) =>
                      updateUnpaidExam(index, "patient_last_name", e.target.value)
                    }
                    placeholder="Unesite prezime"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`reason-${index}`}>Razlog Nenaplaćivanja</Label>
                  <Textarea
                    id={`reason-${index}`}
                    value={exam.reason}
                    onChange={(e) =>
                      updateUnpaidExam(index, "reason", e.target.value)
                    }
                    placeholder="Npr. Kontrolni pregled, Socijalni slučaj, itd."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor={`doctor-${index}`}>Doktor</Label>
                  <Select
                    value={exam.doctor_id || "none"}
                    onValueChange={(value) =>
                      updateUnpaidExam(index, "doctor_id", value === "none" ? null : value)
                    }
                  >
                    <SelectTrigger id={`doctor-${index}`}>
                      <SelectValue placeholder="Izaberite doktora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Bez doktora</SelectItem>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.first_name} {doctor.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeUnpaidExam(index)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Ukloni
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}

        {unpaidExams.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium">
              Ukupno nenaplaćenih pregleda: <span className="text-lg">{unpaidExams.length}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
