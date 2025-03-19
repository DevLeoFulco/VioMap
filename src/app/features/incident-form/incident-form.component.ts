import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IncidentService } from '../../core/services/incident.service';
import { Router } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import moment from 'moment';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

registerLocaleData(localePt);

type Gender = 'Masculino' | 'Feminino' | 'Outro' | 'Não informado';
type IncidentType = 'Roubo' | 'Furto' | 'Agressão física' | 'Agressão verbal' | 'Assédio' | 
  'Homicídio' | 'Tentativa de homicídio' | 'Tráfico de drogas' | 'Vandalismo' | 
  'Arrombamento' | 'Sequestro' | 'Outro';
type TransportMethod = 'A pé' | 'Carro' | 'Moto' | 'Bicicleta' | 'Transporte público' | 
  'Outro' | 'Não identificado';

const INCIDENT_TYPES: IncidentType[] = [
  'Roubo', 'Furto', 'Agressão física', 'Agressão verbal', 'Assédio', 
  'Homicídio', 'Tentativa de homicídio', 'Tráfico de drogas',
  'Vandalismo', 'Arrombamento', 'Sequestro', 'Outro'
];

const TRANSPORT_METHODS: TransportMethod[] = [
  'A pé', 'Carro', 'Moto', 'Bicicleta', 'Transporte público', 'Outro', 'Não identificado'
];

const GENDERS: Gender[] = ['Masculino', 'Feminino', 'Outro', 'Não informado'];

@Component({
  selector: 'app-incident-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './incident-form.component.html',
  styleUrls: ['./incident-form.component.scss']
})
export class IncidentFormComponent implements OnInit {
  incidentForm: FormGroup;
  isSubmitting = false;
  formStep = 1;
  
  readonly incidentTypes = INCIDENT_TYPES;
  readonly transportMethods = TRANSPORT_METHODS;
  readonly genders = GENDERS;

  // Configuração do datepicker
  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    // Não permitir datas futuras
    return date <= new Date();
  };

  constructor(
    private fb: FormBuilder,
    private incidentService: IncidentService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.incidentForm = this.fb.group({
      // Step 1
      street: ['', Validators.required],
      referencePoint: ['', Validators.required],
      dateTime: ['', Validators.required],
      
      // Step 2
      incidentType: ['Roubo', Validators.required],
      transportMethod: ['Não identificado', Validators.required],
      victimCount: [1, [Validators.required, Validators.min(1)]],
      victimGenders: [['Não informado']],
      
      // Step 3
      policeReportFiled: [false],
      policeReportNumber: [''],
      description: [''],
      
      // Location (would typically come from map selection)
      location: this.fb.group({
        lat: [-8.0889],
        lng: -34.9514
      })
    });
  }

  ngOnInit(): void {
    // Configurar locale do moment para português
    moment.locale('pt-br');
  }

  nextStep() {
    if (this.formStep < 3) {
      this.formStep++;
    }
  }

  previousStep() {
    if (this.formStep > 1) {
      this.formStep--;
    }
  }

  updateGenderSelection(gender: Gender, checked: boolean) {
    const currentGenders = this.incidentForm.get('victimGenders')?.value as Gender[];
    if (checked) {
      this.incidentForm.patchValue({
        victimGenders: [...currentGenders, gender]
      });
    } else {
      this.incidentForm.patchValue({
        victimGenders: currentGenders.filter(g => g !== gender)
      });
    }
  }

  isGenderSelected(gender: Gender): boolean {
    return this.incidentForm.get('victimGenders')?.value.includes(gender);
  }

  onDateSelected(event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      const formattedDate = moment(event.value).format('DD/MM/YYYY HH:mm');
      this.incidentForm.patchValue({
        dateTime: formattedDate
      });
    }
  }

  async onSubmit() {
    if (this.formStep < 3) {
      this.nextStep();
      return;
    }

    if (this.incidentForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      try {
        const formData = this.incidentForm.value;
        await this.incidentService.addIncident({
          ...formData,
          datetime: formData.dateTime.toDate(),
          policeReport: {
            filed: formData.policeReportFiled,
            protocolNumber: formData.policeReportNumber
          }
        }).toPromise();

        this.snackBar.open(
          'Ocorrência reportada com sucesso',
          'Fechar',
          { duration: 5000 }
        );

        // Reset form
        this.formStep = 1;
        this.incidentForm.reset({
          street: '',
          referencePoint: '',
          dateTime: moment(),
          victimCount: 1,
          victimGenders: ['Não informado'],
          incidentType: 'Roubo',
          transportMethod: 'Não identificado',
          policeReportFiled: false,
          policeReportNumber: '',
          description: '',
          location: {
            lat: -8.0889,
            lng: -34.9514
          }
        });

        // Navigate to map view
        this.router.navigate(['/map']);
      } catch (error) {
        console.error('Error submitting incident:', error);
        this.snackBar.open(
          'Erro ao enviar ocorrência. Tente novamente mais tarde.',
          'Fechar',
          { duration: 5000 }
        );
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}