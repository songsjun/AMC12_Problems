# 2008 AMC 12B Problem 22

## Problem
A parking lot has 16 spaces in a row. Twelve cars arrive, each of which requires one parking space, and their drivers chose spaces at random from among the available spaces. Auntie Em then arrives in her SUV, which requires 2 adjacent spaces. What is the probability that she is able to park?

$\textbf{(A)} \; \frac {11}{20} \qquad \textbf{(B)} \; \frac {4}{7} \qquad \textbf{(C)} \; \frac {81}{140} \qquad \textbf{(D)} \; \frac {3}{5} \qquad \textbf{(E)} \; \frac {17}{28}$
## Solution
Auntie Em won't be able to park only when none of the four available spots touch. We can form a [bijection](https://artofproblemsolving.com/wiki/index.php/bijection) between all such cases and the number of ways to pick four spots out of 13: since none of the spots touch, remove a spot from between each of the cars. From the other direction, given four spots out of 13, simply add a spot between each.
So the probability she can park is $1-\frac=1-\frac{13\cdot12\cdot11\cdot10}{16\cdot15\cdot14\cdot13}=1-\frac{11}{28}={\textbf{(E)}\frac{17}{28}}.$

(Bijection: When elements of two sets are perfectly paired with each other, i.e. each and every element from both sets has exactly one match in the other, and no elements are left out. In the context of this problem, this means the number of distinct ways to order the cars such that no two spaces are adjacent is exactly the number of ways to pick 4 spots out of 13.)
## Further Explanation
Instead of trying to park the cars one at a time(considering the number of choices for the first car, then the second, and so on), imagine that all of the cars are already parked, and ignore the empty parking spaces for now. This will take up 12 parking spaces, illustrated as asterisks:

 ************

We know that 4 spaces must be left empty, and we care about the arrangements where no empty spaces are next to one another. Notice that this is simply the number of ways to put 4|s into 13 slots (including the "slot" in front of the first car as well):

|*****|*|*|***** $\text{(this works)}$

|******||*|***** $\text{(this doesn't)}$

In other words, after a space between two cars has been selected to be empty, that space is no longer an option for the next selection. The number of available spaces will decrease by one every time, so we have 13*12*11*10 ways to arrange the empty spaces. But the empty spaces are identical, so we must divide by the number of orders in which we can place the empty spaces, or 4!. This is equivalent to $\binom{13}{4}$ total ways to arrange 4 empty spaces into 13 "slots". Then we continue similarly to the above.
## Solution 2 (distributions)
This solution is pretty similar to the above. So there are 4 spots remaining, and it would be hard to count all the combinations where Auntie Em could park, but you can count all the combinations where Auntie Em can't park. Since the 12 cars are indistinguishable, we can use distributions here.

There must be $a_1\geq 0$ cars, then an empty spot, then $d_2\geq 1$ cars, then an empty spot, then $d_3\geq 1$ cars, then an empty spot, then $d_4\geq 1$ cars, then an empty spot, then $a_5\geq 0$ cars.

$$a_1 + d_2 + d_3 + d_4 + a_5 = 12$$

To remove all the restrictions, let $a_n=d_n - 1$.

$$a_1 + a_2 + a_3 + a_4 + a_5 = 9$$

We can now use stars and bars on these values (9 "stars", and $5 - 1 = 4$ dividers), to get $\binom{13}{4}$ possibilities where she can't park. There are $\binom{16}{4}$ possibilities in total.

$$\frac{\binom{13}{4}}{\binom{16}{4}} = \frac{11}{28}$$

Subtracting that from 1 to get the probability she can park, the correct answer is $\boxed{E}.$
## See Also
