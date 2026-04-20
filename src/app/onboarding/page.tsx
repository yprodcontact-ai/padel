'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { completeOnboarding, getClubs } from './actions'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [clubs, setClubs] = useState<{ id: string; nom: string; ville: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    getClubs().then(setClubs)
  }, [])

  const nextStep = () => {
    if (formRef.current && formRef.current.reportValidity()) {
      setStep((s) => Math.min(s + 1, 3))
    }
  }
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complétez votre profil</CardTitle>
          <CardDescription>Étape {step} sur 3</CardDescription>
          <div className="mt-2 flex w-full space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  step >= i ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <form 
            ref={formRef} 
            action={(formData) => {
              setIsLoading(true)
              completeOnboarding(formData).finally(() => setIsLoading(false))
            }} 
            className="space-y-6"
          >
            {/* ETAPE 1 */}
            <div className={step === 1 ? 'block' : 'hidden'}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input id="prenom" name="prenom" required={step === 1} placeholder="Jean" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    <Input id="nom" name="nom" required={step === 1} placeholder="Dupont" className="h-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_naissance">Date de naissance</Label>
                  <Input id="date_naissance" name="date_naissance" type="date" required={step === 1} className="h-12" />
                </div>
                <div className="space-y-2 pt-2">
                  <Label>Sexe</Label>
                  <RadioGroup name="sexe" defaultValue="homme" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="homme" id="r-homme" />
                      <Label htmlFor="r-homme" className="font-normal">Homme</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="femme" id="r-femme" />
                      <Label htmlFor="r-femme" className="font-normal">Femme</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="autre" id="r-autre" />
                      <Label htmlFor="r-autre" className="font-normal">Autre</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* ETAPE 2 */}
            <div className={step === 2 ? 'block' : 'hidden'}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ville">Ville principale</Label>
                  <Input id="ville" name="ville" required={step === 2} placeholder="Paris" className="h-12" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="niveau">Niveau (1.0 à 8.0)</Label>
                  <Input 
                    id="niveau" 
                    name="niveau" 
                    type="number" 
                    step="0.5" 
                    min="1" 
                    max="8" 
                    required={step === 2} 
                    className="h-12" 
                    defaultValue="4.0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ex: 2.0 (Débutant), 4.0 (Intermédiaire), 7.0 (Avancé), 8.0 (Pro)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="club_id">Club préféré / régulier (Optionnel)</Label>
                  <Select name="club_id">
                    <SelectTrigger className="h-12 w-full">
                      <SelectValue placeholder="Sélectionnez un club" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun / Je ne joue pas en club</SelectItem>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.nom} ({club.ville})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ETAPE 3 */}
            <div className={step === 3 ? 'block' : 'hidden'}>
               <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="photo">Photo de profil (Optionnel)</Label>
                  <Input id="photo" name="photo" type="file" accept="image/*" className="h-12 text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </div>
                
                <div className="space-y-2">
                  <Label>Main dominante</Label>
                  <RadioGroup name="main" defaultValue="droite" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="droite" id="m-droite" />
                      <Label htmlFor="m-droite" className="font-normal">Droite</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gauche" id="m-gauche" />
                      <Label htmlFor="m-gauche" className="font-normal">Gauche</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ambidextre" id="m-ambidextre" />
                      <Label htmlFor="m-ambidextre" className="font-normal">Ambidextre</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Poste préféré</Label>
                  <RadioGroup name="poste" defaultValue="indifférent" className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="droite" id="p-droite" />
                      <Label htmlFor="p-droite" className="font-normal">Joueur de Droite</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gauche" id="p-gauche" />
                      <Label htmlFor="p-gauche" className="font-normal">Joueur de Gauche</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="indifférent" id="p-indifferent" />
                      <Label htmlFor="p-indifferent" className="font-normal">Indifférent (Je m&apos;adapte)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep} className="h-12 w-1/3">
                  Précédent
                </Button>
              ) : (
                <div className="w-1/3" />
              )}
              
              {step < 3 ? (
                <Button type="button" onClick={nextStep} className="h-12 w-1/2">
                  Suivant
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading} className="h-12 w-1/2">
                  {isLoading ? 'Enregistrement...' : 'Terminer'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
