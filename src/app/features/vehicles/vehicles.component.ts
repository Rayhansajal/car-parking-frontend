import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../core/services/vehicle.service';
import { VehicleRequestDTO, VehicleResponseDTO, VehicleType } from '../../models/vehicle.model';

@Component({
  selector: 'app-vehicles',
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss'
})
export class VehiclesComponent implements OnInit {
  vehicles: VehicleResponseDTO[] = [];
  loading = false;
  error = '';
  searchTerm = '';

  showModal = false;
  isEditing = false;
  selectedVehicleId: number | null = null;

  vehicleTypes: VehicleType[] = ['TWO_WHEELER', 'FOUR_WHEELER', 'EV', 'HANDICAPPED', 'HEAVY'];
  form: VehicleRequestDTO = this.createEmptyForm();

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  openCreateModal(): void {
    this.form = this.createEmptyForm();
    this.isEditing = false;
    this.selectedVehicleId = null;
    this.showModal = true;
  }

  editVehicle(vehicle: VehicleResponseDTO): void {
    this.form = {
      plateNo: vehicle.plateNo,
      type: vehicle.type,
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      color: vehicle.color || ''
    };
    this.isEditing = true;
    this.selectedVehicleId = vehicle.id;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.form = this.createEmptyForm();
    this.selectedVehicleId = null;
    this.isEditing = false;
  }

  loadVehicles(): void {
    this.loading = true;
    this.error = '';

    this.vehicleService.getMyVehicles().subscribe({
      next: (response: unknown) => {
        this.vehicles = this.extractList<VehicleResponseDTO>(response);
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.error = this.getErrorMessage(err, 'Failed to load vehicles.');
        this.loading = false;
      }
    });
  }

  saveVehicle(): void {
    if (!this.form.plateNo.trim()) {
      alert('Please enter a plate number.');
      return;
    }

    if (!this.form.type) {
      alert('Please select a vehicle type.');
      return;
    }

    if (this.isEditing && this.selectedVehicleId !== null) {
      this.updateVehicle();
    } else {
      this.createVehicle();
    }
  }

  deleteVehicle(id: number): void {
    if (!confirm('Delete this vehicle?')) return;

    this.vehicleService.delete(id).subscribe({
      next: () => {
        alert('Vehicle deleted successfully.');
        this.loadVehicles();
      },
      error: (err: unknown) => {
        console.error(err);
        alert(this.getErrorMessage(err, 'Failed to delete vehicle.'));
      }
    });
  }

  get filteredVehicles(): VehicleResponseDTO[] {
    const search = this.searchTerm.trim().toLowerCase();
    if (!search) return this.vehicles;

    return this.vehicles.filter(vehicle =>
      vehicle.plateNo.toLowerCase().includes(search) ||
      vehicle.type.toString().toLowerCase().includes(search) ||
      (vehicle.brand || '').toLowerCase().includes(search) ||
      (vehicle.model || '').toLowerCase().includes(search) ||
      (vehicle.color || '').toLowerCase().includes(search)
    );
  }

  getVehicleDetails(vehicle: VehicleResponseDTO): string {
    const details = [vehicle.brand, vehicle.model, vehicle.color]
      .filter(value => value && value.trim())
      .join(' / ');

    return details || 'No details added';
  }

  formatVehicleType(type: VehicleType): string {
    return type.toString().replace(/_/g, ' ');
  }

  private createVehicle(): void {
    this.vehicleService.create(this.buildRequestPayload()).subscribe({
      next: () => {
        alert('Vehicle registered successfully.');
        this.closeModal();
        this.loadVehicles();
      },
      error: (err: unknown) => {
        console.error(err);
        alert(this.getErrorMessage(err, 'Failed to register vehicle.'));
      }
    });
  }

  private updateVehicle(): void {
    if (this.selectedVehicleId === null) return;

    this.vehicleService.update(this.selectedVehicleId, this.buildRequestPayload()).subscribe({
      next: () => {
        alert('Vehicle updated successfully.');
        this.closeModal();
        this.loadVehicles();
      },
      error: (err: unknown) => {
        console.error(err);
        alert(this.getErrorMessage(err, 'Failed to update vehicle.'));
      }
    });
  }

  private buildRequestPayload(): VehicleRequestDTO {
    return {
      plateNo: this.form.plateNo.trim(),
      type: this.form.type,
      ...this.optionalText('brand', this.form.brand),
      ...this.optionalText('model', this.form.model),
      ...this.optionalText('color', this.form.color)
    };
  }

  private optionalText(key: 'brand' | 'model' | 'color', value?: string): Partial<VehicleRequestDTO> {
    const trimmed = value?.trim();
    return trimmed ? { [key]: trimmed } : {};
  }

  private createEmptyForm(): VehicleRequestDTO {
    return {
      plateNo: '',
      type: 'FOUR_WHEELER',
      brand: '',
      model: '',
      color: ''
    };
  }

  private extractList<T>(response: unknown): T[] {
    if (Array.isArray(response)) return response as T[];

    if (this.isRecord(response)) {
      const content = response['content'];
      if (Array.isArray(content)) return content as T[];

      const data = response['data'];
      if (Array.isArray(data)) return data as T[];

      if (this.isRecord(data)) {
        const dataContent = data['content'];
        if (Array.isArray(dataContent)) return dataContent as T[];
      }

      const embedded = response['_embedded'];
      if (this.isRecord(embedded)) {
        const firstEmbeddedList = Object.values(embedded).find(Array.isArray);
        if (Array.isArray(firstEmbeddedList)) return firstEmbeddedList as T[];
      }
    }

    return [];
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const backendError = error.error;

      if (this.isRecord(backendError)) {
        const message = backendError['message'];
        const validationDetails = this.getValidationDetails(backendError);
        if (typeof message === 'string' && message.trim()) {
          return validationDetails ? `${fallback}: ${message}. ${validationDetails}` : `${fallback}: ${message}`;
        }

        const errorMessage = backendError['error'];
        if (typeof errorMessage === 'string' && errorMessage.trim()) {
          return validationDetails ? `${fallback}: ${errorMessage}. ${validationDetails}` : `${fallback}: ${errorMessage}`;
        }

        if (validationDetails) return `${fallback}: ${validationDetails}`;
      }

      if (typeof backendError === 'string' && backendError.trim()) return `${fallback}: ${backendError}`;
      if (error.status) return `${fallback} Server returned ${error.status}.`;
    }

    return fallback;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private getValidationDetails(errorBody: Record<string, unknown>): string {
    const errors = errorBody['errors'];

    if (Array.isArray(errors)) {
      return errors
        .map(error => this.formatValidationError(error))
        .filter(Boolean)
        .join(', ');
    }

    if (this.isRecord(errors)) {
      return Object.entries(errors)
        .map(([field, message]) => `${field}: ${this.formatValidationError(message)}`)
        .filter(detail => !detail.endsWith(': '))
        .join(', ');
    }

    return '';
  }

  private formatValidationError(error: unknown): string {
    if (typeof error === 'string') return error;

    if (this.isRecord(error)) {
      const field = error['field'];
      const message = error['message'] || error['defaultMessage'];

      if (typeof field === 'string' && typeof message === 'string') return `${field}: ${message}`;
      if (typeof message === 'string') return message;
    }

    return '';
  }

}
