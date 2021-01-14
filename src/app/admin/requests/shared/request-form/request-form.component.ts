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
import { IRequestNew } from '../../../../shared/models/requests';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Beneficiary } from '@app/shared/models';

export enum RequestTypeRomanian {
  warm_lunch = 'Prânz Cald',
  grocery = 'Produse Alimentare',
  medicine = 'Medicamente',
  invoices = 'Achitare Facturi',
  transport = 'Transport Persoana',
}

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestFormComponent implements OnInit {
  request: IRequestNew;
  form: FormGroup;
  zones: Array<string> = Object.keys(ZONES).filter((key) => isNaN(+key));
  needs = RequestTypeRomanian;
  specialConditions = SPECIAL_CONDITIONS;
  existentBeneficiary: Beneficiary = {} as Beneficiary;
  validAddress = true;
  requestAddress = '';
  beneficiaryName = '';

  constructor(
    private requestsFacade: RequestsFacade,
    private beneficiariesService: BeneficiariesService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) protected data: { element: IRequestNew }
  ) {}

  onSubmit() {
    if (this.form.invalid) return;

    // console.log({
    //   ...this.form.value,
    // });

    // this.requestsFacade.saveRequest({
    //   ...this.form.value,
    // });
  }

  ngOnInit(): void {
    this.request = this.data.element;
    this.form = new FormGroup({
      beneficiary: new FormGroup({
        first_name: new FormControl(
          this.isEmpty(this.request)
            ? null
            : this.request.beneficiary.first_name,
          [Validators.required]
        ),
        last_name: new FormControl(
          this.isEmpty(this.request)
            ? null
            : this.request.beneficiary.last_name,
          [Validators.required]
        ),
        age: new FormControl(
          this.isEmpty(this.request) ? null : this.request.beneficiary.age
        ),
        zone: new FormControl(
          this.isEmpty(this.request) ? null : this.request.beneficiary.zone,
          [Validators.required]
        ),
        address: new FormControl(
          this.isEmpty(this.request) ? null : this.request.beneficiary.address,
          [Validators.required]
        ),
        apartment: new FormControl(
          this.isEmpty(this.request) ? null : this.request.beneficiary.apartment
        ),
        entrance: new FormControl(
          this.isEmpty(this.request) ? null : this.request.beneficiary.entrance
        ),
        floor: new FormControl(
          this.isEmpty(this.request) ? null : this.request.beneficiary.floor
        ),
        phone: new FormControl(
          this.isEmpty(this.request) ? null : this.request.beneficiary.phone,
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(8),
            Validators.pattern(/^([0-9]){8}$/),
          ]
        ),
        landline: new FormControl(
          this.isEmpty(this.request) ? null : this.request.beneficiary.landline,
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(6),
            Validators.pattern(/^([0-9]){6}$/),
          ]
        ),
        special_condition: new FormControl(
          this.isEmpty(this.request)
            ? null
            : this.request.beneficiary.special_condition,
          [Validators.required]
        ),
      }),
      has_symptoms: new FormControl(
        this.isEmpty(this.request) ? null : this.request.has_symptoms,
        [Validators.required]
      ),
      type: new FormControl(
        this.isEmpty(this.request) ? '' : this.request.type,
        [Validators.required]
      ),
      comments: new FormControl(
        this.isEmpty(this.request) ? '' : this.request.comments
      ),
      secret: new FormControl(
        this.isEmpty(this.request) ? this.getSecret() : null,
        [Validators.required, Validators.minLength(5), Validators.maxLength(5)]
      ),
      urgent: new FormControl(
        this.isEmpty(this.request) ? false : this.request.urgent
      ),
    });
    if (!this.isEmpty(this.request))
      this.requestAddress = this.request.beneficiary.address;
  }

  getEnumKeyByEnumValue(myEnum, enumValue) {
    const keys = Object.keys(myEnum).filter((x) => myEnum[x] === enumValue);
    return keys.length > 0 ? keys[0] : null;
  }

  enumUnsorted() {}

  checkForExistentBeneficiary(phone: any) {
    if (phone.length === 8 && this.isEmpty(this.request)) {
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
      .patchValue(this.existentBeneficiary.landline);
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

  isEmpty(obj: IRequestNew | Beneficiary) {
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

  checkPassword() {
    if (!this.isEmpty(this.request)) {
      if (this.form.get('password').value !== this.request.secret) {
        return true;
      }
    }
    return false;
  }
}
