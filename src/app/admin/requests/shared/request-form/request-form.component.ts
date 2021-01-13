import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SPECIAL_CONDITIONS, ZONES } from '@app/shared/constants';
import { RequestsFacade } from '../../requests.facade';
import { BeneficiariesService } from '../../../beneficiaries/beneficiaries.service';
import { coordinates } from './request-address-field/request-address-field.component';
import {
  IRequestDetails,
  RequestTypeUpdated,
} from '../../../../shared/models/requests';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Beneficiary } from '@app/shared/models';

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestFormComponent implements OnInit, OnDestroy {
  request: IRequestDetails;
  form: FormGroup;
  zones: Array<string> = Object.keys(ZONES).filter((key) => isNaN(+key));
  needs = RequestTypeUpdated;
  specialConditions = SPECIAL_CONDITIONS;
  existentBeneficiary: Beneficiary = {} as Beneficiary;
  validAddress = true;
  requestAddress = '';
  beneficiaryName = '';

  constructor(
    private requestsFacade: RequestsFacade,
    private beneficiariesService: BeneficiariesService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) protected data: { element: IRequestDetails }
  ) {}

  onSubmit(ev: Event) {}

  ngOnInit(): void {
    this.request = this.data.element;
    this.form = new FormGroup({
      first_name: new FormControl(
        this.isEmpty(this.request) ? null : this.request.first_name,
        [Validators.required]
      ),
      last_name: new FormControl(
        this.isEmpty(this.request) ? null : this.request.last_name,
        [Validators.required]
      ),
      age: new FormControl(
        this.isEmpty(this.request) ? null : this.request.age
      ),
      zone: new FormControl(
        this.isEmpty(this.request) ? null : this.request.zone,
        [Validators.required]
      ),
      address: new FormControl(
        this.isEmpty(this.request) ? null : this.request.address,
        [Validators.required]
      ),
      apartment: new FormControl(this.isEmpty(this.request) ? null : '?'),
      entrance: new FormControl(this.isEmpty(this.request) ? null : '?'),
      floor: new FormControl(this.isEmpty(this.request) ? null : '?'),
      phone: new FormControl(
        this.isEmpty(this.request) ? null : this.request.phone,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(8),
          Validators.pattern(/^([0-9]){8}$/),
        ]
      ),
      landline: new FormControl(this.isEmpty(this.request) ? null : '0', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern(/^([0-9]){6}$/),
      ]),
      special_condition: new FormControl(
        this.isEmpty(this.request) ? null : '?',
        [Validators.required]
      ),
      ilness: new FormControl(
        this.isEmpty(this.request) ? null : this.request.has_symptoms,
        [Validators.required]
      ),
      need: new FormControl(
        this.isEmpty(this.request) ? '' : this.request.type,
        [Validators.required]
      ),
      comments: new FormControl(
        this.isEmpty(this.request) ? '' : this.request.comments
      ),
      password: new FormControl(
        this.isEmpty(this.request) ? this.getSecret() : null,
        [Validators.required, Validators.minLength(5), Validators.maxLength(5)]
      ),
      urgent: new FormControl(
        this.isEmpty(this.request) ? false : this.request.is_urgent
      ),
    });
    if (!this.isEmpty(this.request)) this.requestAddress = this.request.address;
  }

  ngOnDestroy() {}

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
          setTimeout(() => {}, 3000);
          console.error('ERROR: ' + error);
        }
      );
    }
  }

  updateDataFromBeneficiary() {
    this.form.get('last_name').patchValue(this.existentBeneficiary.last_name);
    this.form.get('first_name').patchValue(this.existentBeneficiary.first_name);
    this.form.get('age').patchValue(this.existentBeneficiary.age);
    this.form.get('zone').patchValue(this.existentBeneficiary.zone);
    this.form.get('address').patchValue(this.existentBeneficiary.address);
    this.form.get('entrance').patchValue(this.existentBeneficiary.entrance);
    this.form.get('floor').patchValue(this.existentBeneficiary.floor);
    this.form.get('apartment').patchValue(this.existentBeneficiary.apartment);
    this.form
      .get('special_condition')
      .patchValue(this.existentBeneficiary.special_condition);
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

  isEmpty(obj: IRequestDetails | Beneficiary) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  getSecret() {
    const randomNumber = (max: number) => Math.floor(Math.random() * max);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const alpha = alphabet[randomNumber(alphabet.length)];
    const digits = Array.from({ length: 3 }, () => randomNumber(10));
    return `${alpha}${digits.join('')}`;
  }

  validatePassword() {
    if (!this.isEmpty(this.request)) {
      if (this.form.get('password').value !== this.request.secret) {
        return true;
      }
    }
    return false;
  }
}
