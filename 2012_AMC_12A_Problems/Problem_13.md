# 2012 AMC 12A Problem 13

> This problem is the same as [2012 AMC 12A #13](https://artofproblemsolving.com/wiki/index.php/2012_AMC_12A_Problems) and [2012 AMC 10A #19](https://artofproblemsolving.com/wiki/index.php/2012_AMC_10A_Problems).
## Problem 19
Paula the painter and her two helpers each paint at constant, but different, rates. They always start at 8:00 AM, and all three always take the same amount of time to eat lunch. On Monday the three of them painted 50% of a house, quitting at 4:00 PM. On Tuesday, when Paula wasn't there, the two helpers painted only 24% of the house and quit at 2:12 PM. On Wednesday Paula worked by herself and finished the house by working until 7:12 P.M. How long, in minutes, was each day's lunch break?

$\textbf{(A)}\ 30\qquad\textbf{(B)}\ 36\qquad\textbf{(C)}\ 42\qquad\textbf{(D)}\ 48\qquad\textbf{(E)}\ 60$
## Solution
Let Paula work at a rate of $p$, the two helpers work at a combined rate of $h$, and the time it takes to eat lunch be $L$, where $p$ and $h$ are in house/hours and L is in hours. Then the labor on Monday, Tuesday, and Wednesday can be represented by the three following equations:


$$(8-L)(p+h)=50$$


$$(6.2-L)h=24$$


$$(11.2-L)p=26$$


With three equations and three variables, we need to find the value of $L$.
Adding the second and third equations together gives us $6.2h+11.2p-L(p+h)=50$. Subtracting the first equation from this new one gives us $-1.8h+3.2p=0$, so we get $h=\frac{16}{9}p$.
Plugging into the second equation:


$$(6.2-L)\frac{16}{9}p=24$$


$$(6.2-L)p=\frac{27}{2}$$


We can then subtract this from the third equation:


$$5p=26-\frac{27}{2}$$


$$p=\frac{5}{2}$$


Plugging $p$ into our third equation gives:

$$L=\frac{4}{5}$$


Converting $L$ from hours to minutes gives us $L=48$ minutes, which is $\boxed{\textbf{(D)}\ 48}$.
## Solution 2 (Modular Arithmetic)
Because Paula worked from

$$8:00 \text{A.M.}$$

 to

$$7:12 \text{P.M.}$$

, she worked for 11 hours and 12 minutes = 672 minutes. Since there is $100-50-24=26$% of the house left, we get the equation $26a=672$. Because $672$ is $22$ mod $26$, looking at our answer choices, the only answer that is $22\text{mod}26$ is $48$. So the answer is $\boxed{\textbf{(D)}\ 48}$.
## Solution 3 (GCD)
We factor out the equations to be $(8-n)\left(\frac{1}{p}+\frac{1}{h}\right)=\frac{1}{2},\left(\frac{31}{5}-n\right)\left(\frac{1}{h}\right)=\frac{6}{25} \text{ and } \left(\frac{56}{5}-n\right)\left(\frac{1}{p}=\frac{13}{50}\right)$, where n is the number of hours for the break, p is the time Paula requires, and h is the time her helpers require. We find that when we select $\mathbf{D}$, we have them being $10.4$ and $5.4$, which correspond to being multiples of 13 and 6. Checking, we find that this satisfies the first equation, so multiplying $\cdot 60= \boxed{48.}$
## See Also
