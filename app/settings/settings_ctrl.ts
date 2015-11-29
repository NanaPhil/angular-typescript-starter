import {ILookUpModel, LookUpService} from "./lookup_service";
import { Routes } from '../helpers/config_keys';
import {ILookUp} from "../schemas/entity_set";
import {IRequestResult} from "../schemas/structure"

let _ = require("underscore");

class SettingsCtrl {
	models = LookUpService.Models;

	static $inject = ["$state"];

	constructor(private $state: angular.ui.IStateService) { }

	gotoSetting(setting: ILookUpModel) {
		if (setting) {
			this.$state.go(setting.route, { setting: setting.name })
		} else {
			this.$state.go(Routes.Settings)
		}
	}

}

class SettingCtrl {
	showForm: boolean;
	formTitle: string;
	gridSize: string = "col-sm-12";
	newRecord: ILookUp;
	model: ILookUpModel;
	records: Array<ILookUp>;

	static $inject = ["$state", "$stateParams", "$http", "$q", "BASEAPI"];

	constructor(private $state: angular.ui.IStateService,
		private $stateParams: angular.ui.IStateParamsService,
		private $http: angular.IHttpService,
		private $q: angular.IQService,
		private baseUrl: string) {
		this.model = _.findWhere(LookUpService.Models, { name: $stateParams['setting'] })
		this.fetch()
		this.closeForm()
	}

	addNew() {
		this.formTitle = `Add New ${this.model.label}`
		this.newRecord = null
		this.setUpFormView()
	}

	edit(record: ILookUp) {
		this.formTitle = `Edit ${this.model.label}`
		this.newRecord = angular.copy(record)
		this.setUpFormView()
	}

	closeForm() {
		this.showForm = false
		this.gridSize = "col-sm-12"
		this.clear()
	}

	clear() { this.newRecord = null }

	fetch() {
		this.$http.get(`${this.baseUrl}/${this.model.name}`)
			.then((response: IRequestResult<Array<ILookUp>>) => {
				this.records = response.data
			})
	}

	saveRecord(record: ILookUp) {
		if (record.id) {
			//Update Record
			this.$http.put(`${this.baseUrl}/${this.model.name}`, record)
				.then((response: IRequestResult<ILookUp>) => {
					if (response.success) {
						var recordIndex = _.findIndex(this.records, { id: record.id })
						this.records[recordIndex] = response.data
						this.closeForm()
					}
				})
		} else {
			//Save New Record
			this.$http.post(`${this.baseUrl}/${this.model.name}`, record)
				.then((response: IRequestResult<ILookUp>) => {
					if (response.success) {
						this.records.push(response.data)
						this.closeForm()
					}
				})
		}
	}

	deleteRecord(record: ILookUp) {
		this.$http.delete(`${this.baseUrl}/${this.model.name}?id=${record.id}`)
			.then((response: IRequestResult<ILookUp>) => {
				if (response.success) {
					var recordIndex = _.findIndex(this.records, { id: record.id })
					this.records.splice(recordIndex, 1)
					this.closeForm()
				}
			})
	}

	private setUpFormView() {
		this.showForm = true
		this.gridSize = "col-sm-8"
	}

}

export {SettingsCtrl, SettingCtrl}