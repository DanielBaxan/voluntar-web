import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SPECIAL_CONDITIONS, ZONES } from '@app/shared/constants';
import { RequestsFacade } from '../../requests.facade';
import { BeneficiariesService } from '../../../beneficiaries/beneficiaries.service';
import { coordinates } from './request-address-field/request-address-field.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Beneficiary } from '@app/shared/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { Demand, DemandType } from '@app/shared/models/demand';

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestFormComponent implements OnInit {
  form: FormGroup;
  zones: Array<string> = Object.keys(ZONES).filter((key) => isNaN(+key));
  needs = DemandType;
  specialConditions = SPECIAL_CONDITIONS;
  existentBeneficiary: Beneficiary = {} as Beneficiary;
  validAddress = true;
  requestAddress = '';
  beneficiaryName = '';

  constructor(
    private requestsFacade: RequestsFacade,
    private snackBar: MatSnackBar,
    private beneficiariesService: BeneficiariesService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<RequestFormComponent>,
    @Inject(MAT_DIALOG_DATA) protected data: { element: Demand }
  ) {}

  onSubmit() {
    if (this.form.invalid) return;

    const payload = {
      ...this.form.value,
    };
    payload.beneficiary.landline = `22${payload.beneficiary.landline}`;

    console.log(payload);

    // this.requestsFacade.saveRequest(payload);
    // combineLatest([this.requestsFacade.isLoading$, this.requestsFacade.error$])
    //   .pipe(
    //     filter(([status, error]) => !status && !error),
    //     first()
    //   )
    //   .subscribe(() => {
    //     this.snackBar.open('Cererea a fost salvată cu success.', '', {
    //       duration: 5000,
    //       horizontalPosition: 'right',
    //       verticalPosition: 'top',
    //     });
    //     this.closeDialog();
    //   });
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      beneficiary: new FormGroup({
        first_name: new FormControl(null, [Validators.required]),
        last_name: new FormControl(null, [Validators.required]),
        age: new FormControl(null),
        zone: new FormControl(null, [Validators.required]),
        address: new FormControl(null, [Validators.required]),
        apartment: new FormControl(null),
        entrance: new FormControl(null),
        floor: new FormControl(null),
        phone: new FormControl(null, [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(8),
          Validators.pattern(/^([0-9]){8}$/),
        ]),
        landline: new FormControl(null, [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.pattern(/^([0-9]){6}$/),
        ]),
        special_condition: new FormControl(null, [Validators.required]),
      }),
      has_symptoms: new FormControl(null, [Validators.required]),
      type: new FormControl('', [Validators.required]),
      comments: new FormControl(''),
      secret: new FormControl(this.getSecret(), [
        (Validators.required, Validators.minLength(5), Validators.maxLength(5)),
      ]),
      urgent: new FormControl(false),
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  enumUnsorted() {}

  checkForExistentBeneficiary(phone: any) {
    if (phone.length === 8) {
      this.beneficiariesService.getBeneficiariesByFilter({ phone }).subscribe(
        (success) => {
          if (success.count !== 0) {
            this.existentBeneficiary = success.list[0];
            this.beneficiaryName =
              this.existentBeneficiary.last_name +
              ' ' +
              this.existentBeneficiary.first_name;
          }
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('ERROR: ' + error);
        }
      );
    }
  }

  updateDataFromBeneficiary() {
    this.form
      .get('beneficiary.last_name')
      .patchValue(this.existentBeneficiary.last_name);
    this.form
      .get('beneficiary.first_name')
      .patchValue(this.existentBeneficiary.first_name);
    this.form
      .get('beneficiary.landline')
      .patchValue(
        this.existentBeneficiary.landline.substring(
          2,
          this.existentBeneficiary.landline.length
        )
      );
    this.form.get('beneficiary.age').patchValue(this.existentBeneficiary.age);
    this.form.get('beneficiary.zone').patchValue(this.existentBeneficiary.zone);
    this.form
      .get('beneficiary.address')
      .patchValue(this.existentBeneficiary.address);
    this.form
      .get('beneficiary.entrance')
      .patchValue(this.existentBeneficiary.entrance);
    this.form
      .get('beneficiary.floor')
      .patchValue(this.existentBeneficiary.floor);
    this.form
      .get('beneficiary.apartment')
      .patchValue(this.existentBeneficiary.apartment);
    this.form
      .get('beneficiary.special_condition')
      .patchValue(this.existentBeneficiary.special_condition);
    this.requestAddress = this.existentBeneficiary.address;
  }

  getUrgentStyleObject() {
    if (this.form.get('urgent').value === false) {
      return { backgroundColor: 'white', color: '#ed5555' };
    } else return { backgroundColor: '#ed5555', color: 'white' };
  }

  updateAddress(event: coordinates) {
    this.form.get('address').patchValue(event.address);
    this.validAddress = event.valid;
  }

  isEmpty(obj: Beneficiary) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  getSecret() {
    const randomNumber = (max: number) => Math.floor(Math.random() * max);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const alpha = alphabet[randomNumber(alphabet.length)];
    const digits = Array.from({ length: 4 }, () => randomNumber(10));
    return `${alpha}${digits.join('')}`;
  }
}
