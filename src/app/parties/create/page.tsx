'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { createParty } from './actions'
import { getClubs } from '@/app/onboarding/actions'
import Link from 'next/link'

export default function CreatePartyPage() {
  const [step, setStep] = useState(1)
  const [clubs, setClubs] = useState<{ id: string; nom: string; ville: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Slider State for Dual thumbs (Min / Max)
  const [levelRange, setLevelRange] = useState([3.5, 6.5])

  useEffect(() => {
    getClubs().then(setClubs)
  }, [])

  const nextStep = () => {
    if (formRef.current && formRef.current.reportValidity()) {
      setStep((s) => Math.min(s + 1, 5))
    }
  }
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const submitForm = async () => {
    if (formRef.current && formRef.current.reportValidity()) {
      setIsLoading(true)
      const formData = new FormData(formRef.current)
      formData.append('niveau_min', levelRange[0].toString())
      formData.append('niveau_max', levelRange[1].toString())
      await createParty(formData)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-muted/20">
      <Card className="mx-auto w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">Organiser un match</CardTitle>
          <CardDescription>Étape {step} sur 5</CardDescription>
          <div className="mt-4 flex w-full space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  step >= i ? 'bg-primary' : 'bg-muted'
                } transition-colors duration-300`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <form 
            ref={formRef} 
            className="space-y-6 min-h-[300px] flex flex-col pt-4"
          >
            <div className="flex-1">
               {/* ETAPE 1: Club */}
               <div className={step === 1 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}>
                 <div className="space-y-4">
                   <h2 className="text-xl font-semibold mb-4 text-center">Où voulez-vous jouer ?</h2>
                   <div className="space-y-2">
                     <Label htmlFor="club_id">Sélectionnez le club</Label>
                     <select 
                       name="club_id" 
                       required={step === 1}
                       className="flex h-14 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                       defaultValue=""
                     >
                       <option value="" disabled>Choisir un club dans la liste</option>
                       {clubs.map((club) => (
                         <option key={club.id} value={club.id}>
                           {club.nom} ({club.ville})
                         </option>
                       ))}
                     </select>
                   </div>
                 </div>
               </div>

               {/* ETAPE 2: Date et Heure */}
               <div className={step === 2 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}>
                 <div className="space-y-4">
                   <h2 className="text-xl font-semibold mb-4 text-center">Quand ?</h2>
                   <div className="space-y-2">
                     <Label htmlFor="date_heure">Date et Heure du début</Label>
                     {/* datetime-local opens highly optimized mobile pickers */}
                     <Input 
                       id="date_heure" 
                       name="date_heure" 
                       type="datetime-local" 
                       required={step === 2} 
                       className="h-14 text-lg" 
                     />
                   </div>
                 </div>
               </div>

               {/* ETAPE 3: Niveau requis */}
               <div className={step === 3 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}>
                 <div className="space-y-6">
                   <h2 className="text-xl font-semibold mb-2 text-center">Quel niveau recherchez-vous ?</h2>
                   
                   <div className="flex justify-between items-center text-primary font-bold text-xl px-2">
                     <span>{levelRange[0].toFixed(1)}</span>
                     <span className="text-muted-foreground text-sm font-normal">à</span>
                     <span>{levelRange[1].toFixed(1)}</span>
                   </div>

                   <Slider
                     value={levelRange}
                     min={1}
                     max={8}
                     step={0.5}
                     onValueChange={(val) => setLevelRange(val as number[])}
                     className="py-4"
                   />

                   <div className="flex justify-between text-xs text-muted-foreground">
                     <span>Débutant (1)</span>
                     <span>Moyen (4)</span>
                     <span>Pro (8)</span>
                   </div>
                   {/* Hidden inputs are injected automatically via form action appending, but displaying values so user knows */}
                 </div>
               </div>

               {/* ETAPE 4: Type et Visibilité */}
               <div className={step === 4 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}>
                 <div className="space-y-6">
                   <h2 className="text-xl font-semibold mb-2 text-center">Format de la partie</h2>
                   
                   <div className="space-y-3">
                     <Label className="text-muted-foreground">Type d&apos;événement</Label>
                     <div className="grid grid-cols-1 gap-3">
                       <label className="border-2 rounded-xl p-4 flex items-start cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                         <input type="radio" name="type" value="loisir" defaultChecked className="mt-1 w-4 h-4 accent-primary" />
                         <div className="ml-3">
                           <span className="block font-bold">Loisir</span>
                           <span className="block text-sm text-muted-foreground">On joue pour le fun avec score, détendu.</span>
                         </div>
                       </label>
                       <label className="border-2 rounded-xl p-4 flex items-start cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                         <input type="radio" name="type" value="match" className="mt-1 w-4 h-4 accent-primary" />
                         <div className="ml-3">
                           <span className="block font-bold">Match Compétitif</span>
                           <span className="block text-sm text-muted-foreground">Vrai match amical avec intensité max.</span>
                         </div>
                       </label>
                       <label className="border-2 rounded-xl p-4 flex items-start cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                         <input type="radio" name="type" value="entrainement" className="mt-1 w-4 h-4 accent-primary" />
                         <div className="ml-3">
                           <span className="block font-bold">Entraînement</span>
                           <span className="block text-sm text-muted-foreground">Exercices, paniers, diagonales...</span>
                         </div>
                       </label>
                     </div>
                   </div>

                   <div className="space-y-3 pt-2">
                     <Label className="text-muted-foreground">Visibilité</Label>
                     <div className="flex space-x-4">
                       <label className="flex items-center space-x-2 cursor-pointer">
                         <input type="radio" name="visibilite" value="publique" defaultChecked className="w-5 h-5 accent-primary" />
                         <span className="font-semibold">Publique</span>
                       </label>
                       <label className="flex items-center space-x-2 cursor-pointer">
                         <input type="radio" name="visibilite" value="amis" className="w-5 h-5 accent-primary" />
                         <span className="font-semibold">Match Privé (Amis)</span>
                       </label>
                     </div>
                   </div>

                 </div>
               </div>

               {/* ETAPE 5: Commentaire */}
               <div className={step === 5 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}>
                 <div className="space-y-4">
                   <h2 className="text-xl font-semibold mb-4 text-center">Un dernier mot ?</h2>
                   <div className="space-y-2">
                     <Label htmlFor="commentaire">Commentaire (Optionnel)</Label>
                     <Textarea 
                        id="commentaire" 
                        name="commentaire" 
                        placeholder="Ex: J'amène les balles neuves ! On tourne à droite..." 
                        className="min-h-[120px] resize-none text-base" 
                     />
                   </div>
                 </div>
               </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6 mt-auto border-t">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep} className="h-14 px-6 text-base font-semibold">
                  Retour
                </Button>
              ) : (
                <Link href="/" passHref legacyBehavior>
                  <Button type="button" variant="ghost" className="h-14 px-6 text-base font-semibold text-muted-foreground">
                    Annuler
                  </Button>
                </Link>
              )}
              
              {step < 5 ? (
                <Button type="button" onClick={nextStep} className="h-14 px-8 text-base font-bold ml-auto">
                  Continuer
                </Button>
              ) : (
                <Button type="button" onClick={submitForm} disabled={isLoading} className="h-14 px-8 text-base font-bold ml-auto bg-green-600 hover:bg-green-700">
                  {isLoading ? 'Publication...' : 'Valider et Publier ✨'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
