'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchIcon, SlidersHorizontalIcon } from 'lucide-react'

// Utilisation d'un checkbox simple simulé pour éviter le fichier manquant ui/checkbox s'il n'existe pas
function BasicCheckbox({ checked, onChange, label }: { checked: boolean, onChange: (c: boolean) => void, label: string }) {
   return (
      <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-muted rounded-md transition border">
         <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
         <span className="text-sm font-medium">{label}</span>
      </label>
   )
}

interface FiltersProps {
  initialVille: string;
  initialType: string;
  initialNiveau: number | null;
  initialDispo: boolean;
}

export function SearchFilters({ initialVille, initialType, initialNiveau, initialDispo }: FiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const [ville, setVille] = useState(initialVille)
  const [type, setType] = useState(initialType || 'tous')
  const [niveau, setNiveau] = useState<string>(initialNiveau ? initialNiveau.toString() : 'tous')
  const [dispo, setDispo] = useState(initialDispo)
  const [expanded, setExpanded] = useState(false)

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (ville) params.set('ville', ville)
    if (type && type !== 'tous') params.set('type', type)
    if (niveau && niveau !== 'tous') params.set('niveau', niveau)
    if (dispo) params.set('dispo', 'true')
    
    startTransition(() => {
       router.push(`${pathname}?${params.toString()}`)
    })
  }

  const resetFilters = () => {
    setVille('')
    setType('tous')
    setNiveau('tous')
    setDispo(false)
    startTransition(() => {
       router.push(pathname)
    })
  }

  const activeFiltersCount = (ville ? 1 : 0) + (type !== 'tous' ? 1 : 0) + (niveau !== 'tous' ? 1 : 0) + (dispo ? 1 : 0)

  return (
    <div className="bg-card shadow-sm border p-4 rounded-xl">
       <div className="flex space-x-2">
         <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Ville (ex: Paris)"
              className="pl-9 bg-muted/50"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
         </div>
         <Button 
            variant={activeFiltersCount > 0 ? "default" : "outline"}
            className="px-3"
            onClick={() => setExpanded(!expanded)}
         >
            <SlidersHorizontalIcon className="w-4 h-4 mr-2" />
            {activeFiltersCount > 0 && <span className="bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-[10px] sm:text-xs font-bold mr-2">{activeFiltersCount}</span>}
            Filtres
         </Button>
       </div>

       {expanded && (
          <div className="mt-4 pt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-2">
             
             <div className="space-y-1.5">
                <label className="text-sm font-semibold text-muted-foreground">Type de Partie</label>
                <Select value={type} onValueChange={(val) => setType(val || 'tous')}>
                  <SelectTrigger className="w-full bg-muted/30">
                    <SelectValue placeholder="Tous types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Tous les types</SelectItem>
                    <SelectItem value="loisir">Loisir</SelectItem>
                    <SelectItem value="match">Match Pro</SelectItem>
                    <SelectItem value="entrainement">Entraînement</SelectItem>
                  </SelectContent>
                </Select>
             </div>

             <div className="space-y-1.5">
                <label className="text-sm font-semibold text-muted-foreground">Mon Niveau</label>
                <Select value={niveau} onValueChange={(val) => setNiveau(val || 'tous')}>
                  <SelectTrigger className="w-full bg-muted/30">
                    <SelectValue placeholder="Peu importe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Peu importe</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                       <SelectItem key={n} value={n.toString()}>Niveau {n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>

             <div>
                <BasicCheckbox 
                    label="Places disponibles uniquement" 
                    checked={dispo} 
                    onChange={setDispo} 
                />
             </div>

             <div className="pt-2 flex space-x-3">
                <Button variant="ghost" onClick={resetFilters} className="text-muted-foreground">
                   Réinitialiser
                </Button>
                <Button onClick={applyFilters} className="flex-1" disabled={isPending}>
                   {isPending ? 'Recherche...' : 'Appliquer'}
                </Button>
             </div>

          </div>
       )}
    </div>
  )
}
