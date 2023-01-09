"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular/core/testing");
var scheduled_pending_examinations_component_1 = require("./scheduled-pending-examinations.component");
describe('ScheduledPendingExaminationsComponent', function () {
    var component;
    var fixture;
    beforeEach(testing_1.async(function () {
        testing_1.TestBed.configureTestingModule({
            declarations: [scheduled_pending_examinations_component_1.ScheduledPendingExaminationsComponent]
        })
            .compileComponents();
    }));
    beforeEach(function () {
        fixture = testing_1.TestBed.createComponent(scheduled_pending_examinations_component_1.ScheduledPendingExaminationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', function () {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=scheduled-pending-examinations.component.spec.js.map