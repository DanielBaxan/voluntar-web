import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SPECIAL_CONDITIONS, ZONES } from '@app/shared/constants';
import { RequestsFacade } from '../../requests.facade';
import { coordinates } from './request-address-field/request-address-field.component';
import {
  IRequestDetails,
  RequestTypeUpdated,
} from '../../../../shared/models/requests';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

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
  existentBeneficiary = false;
  validAddress = true;

  constructor(
    private requestsFacade: RequestsFacade,
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
        this.isEmpty(this.request) ? null : this.request.secret,
        [Validators.required, Validators.minLength(5), Validators.maxLength(5)]
      ),
      urgent: new FormControl(
        this.isEmpty(this.request) ? false : this.request.is_urgent
      ),
    });
    if (this.isEmpty(this.request)) this.request.address = '';
  }
  ngOnDestroy() {}

  getEnumKeyByEnumValue(myEnum, enumValue) {
    const keys = Object.keys(myEnum).filter((x) => myEnum[x] === enumValue);
    return keys.length > 0 ? keys[0] : null;
  }

  enumUnsorted() {}

  checkForExistentBeneficiary(phone: any) {
    // this function should display the hidden div if the beneficiary is found
    // check if the logic works
    if (phone.length === 8 && this.isEmpty(this.request))
      this.existentBeneficiary = true;
    else this.existentBeneficiary = false;
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

  isEmpty(obj: IRequestDetails) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }
}
