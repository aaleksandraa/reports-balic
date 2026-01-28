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

  // Combine doctors and associates for the dropdown
  const allStaff = doctors.map(d => ({
    id: d.id,
    name: `${d.first_name} ${d.last_name}`,
    role: d.role
  }));

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
      <CardContent className="space-y-3">
        {unpaidExams.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nema nenaplaćenih pregleda. Kliknite "Dodaj" da dodate novi.
          </p>
        ) : (
          unpaidExams.map((exam, index) => (
            <Card key={index} className="p-3 bg-muted/30">
              <div className="space-y-3">
                {/* First Row: Name, Surname, Doctor/Associate */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor={`first-name-${index}`} className="text-xs">Ime</Label>
                    <Input
                      id={`first-name-${index}`}
                      value={exam.patient_first_name}
                      onChange={(e) =>
                        updateUnpaidExam(index, "patient_first_name", e.target.value)
                      }
                      placeholder="Ime pacijenta"
                      className="h-9"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`last-name-${index}`} className="text-xs">Prezime</Label>
                    <Input
                      id={`last-name-${index}`}
                      value={exam.patient_last_name}
                      onChange={(e) =>
                        updateUnpaidExam(index, "patient_last_name", e.target.value)
                      }
                      placeholder="Prezime pacijenta"
                      className="h-9"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`doctor-${index}`} className="text-xs">Doktor/Saradnik</Label>
                    <Select
                      value={exam.doctor_id || "none"}
                      onValueChange={(value) =>
                        updateUnpaidExam(index, "doctor_id", value === "none" ? null : value)
                      }
                    >
                      <SelectTrigger id={`doctor-${index}`} className="h-9">
                        <SelectValue placeholder="Izaberite" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Bez doktora</SelectItem>
                        {allStaff
                          .filter(s => s.role === 'doctor')
                          .map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name}
                            </SelectItem>
                          ))}
                        {allStaff.filter(s => s.role === 'associate').length > 0 && (
                          <>
                            <SelectItem value="separator" disabled className="text-xs font-semibold">
                              — Saradnici —
                            </SelectItem>
                            {allStaff
                              .filter(s => s.role === 'associate')
                              .map((staff) => (
                                <SelectItem key={staff.id} value={staff.id}>
                                  {staff.name}
                                </SelectItem>
                              ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeUnpaidExam(index)}
                      className="w-full h-9"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Ukloni
                    </Button>
                  </div>
                </div>

                {/* Second Row: Reason */}
                <div>
                  <Label htmlFor={`reason-${index}`} className="text-xs">Razlog Nenaplaćivanja</Label>
                  <Textarea
                    id={`reason-${index}`}
                    value={exam.reason}
                    onChange={(e) =>
                      updateUnpaidExam(index, "reason", e.target.value)
                    }
                    placeholder="Npr. Kontrolni pregled, Socijalni slučaj, itd."
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>
            </Card>
          ))
        )}

        {unpaidExams.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-sm font-medium">
              Ukupno nenaplaćenih pregleda: <span className="text-lg font-bold">{unpaidExams.length}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
