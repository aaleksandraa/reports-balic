import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useServices } from '@/hooks/useServices';

interface ServiceComboboxProps {
  value: string;
  price: number;
  category: 'fiscal' | 'non-fiscal';
  onSelect: (serviceName: string, price: number) => void;
}

export function ServiceCombobox({ value, price, category, onSelect }: ServiceComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const { services } = useServices();

  // Filter services by category
  const filteredServices = services.filter(s => s.category === category && s.active);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSelect = (service: typeof filteredServices[0]) => {
    setInputValue(service.name);
    onSelect(service.name, service.price);
    setOpen(false);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    // Allow custom input - update parent with current price
    onSelect(newValue, price);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-0 bg-transparent hover:bg-accent focus-visible:ring-1 h-9 px-3"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Unesite ili odaberite uslugu..."
            className="flex-1 bg-transparent outline-none text-left"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          />
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Pretraži usluge..." 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground">Nema rezultata</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Možete unijeti custom naziv
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Dostupne usluge">
              {filteredServices.map((service) => (
                <CommandItem
                  key={service.id}
                  value={service.name}
                  onSelect={() => handleSelect(service)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      inputValue === service.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{service.name}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Number(service.price).toFixed(2)} KM
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
