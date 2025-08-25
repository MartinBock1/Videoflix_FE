// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { Register } from './register';

// describe('Register', () => {
//   let component: Register;
//   let fixture: ComponentFixture<Register>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [Register]
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(Register);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });

// =================================================================
// Standard Angular and Testing Imports
// =================================================================
// 1. Globale Jasmine-Funktionen durch explizite Vitest-Importe ersetzen
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Register } from './register';
import { AuthService } from '../../../shared/services/auth.service';

// 2. Mocks für Vitest erstellen (vi.fn() statt jasmine.createSpy())
const mockAuthService = {
  register: vi.fn(),
};
const mockRouter = {
  navigate: vi.fn(),
};
const mockActivatedRoute = {
  snapshot: {
    queryParams: {},
  },
};


describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    // 3. TestBed bleibt fast gleich, aber OHNE Zone-Hacks!
    // Die Vitest-Integration kümmert sich automatisch um die zoneless-Konfiguration.
    await TestBed.configureTestingModule({
      imports: [
        Register,
        CommonModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        // KEINE provideNoopZone() ODER NgZone-HACKS MEHR NÖTIG!
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // 4. Mocks nach jedem Test zurücksetzen
  afterEach(() => {
    vi.clearAllMocks();
    mockActivatedRoute.snapshot.queryParams = {};
  });

  // 5. Der Rest Ihres Codes funktioniert fast 1:1 weiter!
  it('sollte erfolgreich erstellt werden', () => {
    expect(component).toBeTruthy();
  });

  // =================================================================
  // Initialisierungs-Tests
  // =================================================================

  it('sollte erfolgreich erstellt werden', () => {
    expect(component).toBeTruthy();
  });

  it('sollte das Registrierungsformular mit allen Feldern initialisieren', () => {
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.controls['email']).toBeDefined();
    expect(component.registerForm.controls['password']).toBeDefined();
    expect(component.registerForm.controls['confirmPassword']).toBeDefined();
    expect(component.registerForm.controls['privacyPolicy']).toBeDefined();
  });

   it('sollte bei erfolgreicher Registrierung zur Login-Seite navigieren', () => {
    // Formular gültig machen
    component.registerForm.get('email')?.setValue('test@example.com');
    component.registerForm.get('password')?.setValue('password123');
    component.registerForm.get('confirmPassword')?.setValue('password123');
    component.registerForm.get('privacyPolicy')?.setValue(true);

    // Mock-Service konfigurieren
    mockAuthService.register.mockReturnValue(of({ success: true }));

    // Methode aufrufen
    component.onSubmit();

    // Überprüfen, ob der Service aufgerufen wurde
    expect(mockAuthService.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      confirmed_password: 'password123',
    });

    // Überprüfen, ob navigiert wurde
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: {
        message: 'Registration successful! Please check your email for activation.',
      },
    });
  });

  // =================================================================
  // Validierungs-Tests
  // =================================================================

  it('sollte initial ungültig sein', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('sollte gültig sein, wenn alle Felder korrekt ausgefüllt sind', () => {
    const form = component.registerForm;
    form.get('email')?.setValue('test@example.com');
    form.get('password')?.setValue('password123');
    form.get('confirmPassword')?.setValue('password123');
    form.get('privacyPolicy')?.setValue(true);
    
    expect(form.valid).toBeTruthy();
  });

  it('sollte einen Fehler für eine ungültige E-Mail anzeigen', () => {
    const emailControl = component.registerForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
  });

  it('sollte einen Fehler anzeigen, wenn das Passwort zu kurz ist', () => {
    const passwordControl = component.registerForm.get('password');
    passwordControl?.setValue('123'); // Zu kurz
    expect(passwordControl?.valid).toBeFalsy();
  });

  it('sollte einen Fehler anzeigen, wenn die Passwörter nicht übereinstimmen', () => {
    const form = component.registerForm;
    form.get('password')?.setValue('password123');
    form.get('confirmPassword')?.setValue('password456');
    
    expect(form.hasError('passwordMismatch')).toBeTruthy();
  });

  it('sollte einen Fehler anzeigen, wenn die Datenschutzerklärung nicht akzeptiert wurde', () => {
    const privacyControl = component.registerForm.get('privacyPolicy');
    privacyControl?.setValue(false);
    expect(privacyControl?.valid).toBeFalsy();
  });

  // =================================================================
  // Einreichungs-Tests
  // =================================================================

  it('sollte authService.register nicht aufrufen, wenn das Formular ungültig ist', () => {
    component.onSubmit();
    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('sollte bei erfolgreicher Registrierung zur Login-Seite navigieren', () => {
    // Formular gültig machen
    component.registerForm.get('email')?.setValue('test@example.com');
    component.registerForm.get('password')?.setValue('password123');
    component.registerForm.get('confirmPassword')?.setValue('password123');
    component.registerForm.get('privacyPolicy')?.setValue(true);

    // Mock-Service so konfigurieren, dass er einen Erfolg zurückgibt
    mockAuthService.register.and.returnValue(of({ success: true }));

    // Methode aufrufen
    component.onSubmit();

    // Überprüfen, ob der Service mit den richtigen Daten aufgerufen wurde
    expect(mockAuthService.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      confirmed_password: 'password123',
    });

    // Überprüfen, ob zur Login-Seite mit einer Erfolgsmeldung navigiert wurde
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: {
        message: 'Registration successful! Please check your email for activation.',
      },
    });
  });

  it('sollte bei fehlgeschlagener Registrierung eine Fehlermeldung anzeigen', () => {
    // Formular gültig machen
    component.registerForm.get('email')?.setValue('user@exists.com');
    component.registerForm.get('password')?.setValue('password123');
    component.registerForm.get('confirmPassword')?.setValue('password123');
    component.registerForm.get('privacyPolicy')?.setValue(true);

    // Mock-Service so konfigurieren, dass er einen Fehler zurückgibt
    const errorResponse = { message: 'Diese E-Mail wird bereits verwendet.' };
    mockAuthService.register.and.returnValue(throwError(() => errorResponse));
    
    // Methode aufrufen
    component.onSubmit();

    // Überprüfen, ob die Fehlermeldung in der Komponente gesetzt wurde
    expect(component.errorMessage).toBe('Diese E-Mail wird bereits verwendet.');
    
    // Überprüfen, dass nicht navigiert wurde
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  // =================================================================
  // UI-Interaktions-Tests
  // =================================================================

  it('sollte die Sichtbarkeit des Passworts umschalten', () => {
    expect(component.showPassword).toBe(false);
    component.togglePassword();
    expect(component.showPassword).toBe(true);
    component.togglePassword();
    expect(component.showPassword).toBe(false);
  });

  it('sollte die Sichtbarkeit des Bestätigungspassworts umschalten', () => {
    expect(component.showConfirmPassword).toBe(false);
    component.toggleConfirmPassword();
    expect(component.showConfirmPassword).toBe(true);
    component.toggleConfirmPassword();
    expect(component.showConfirmPassword).toBe(false);
  });
});
