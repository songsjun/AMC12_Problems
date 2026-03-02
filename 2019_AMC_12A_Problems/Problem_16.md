# 2019 AMC 12A Problem 16

> This problem is the same as [2019 AMC 10A #20](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10A_Problems) and [2019 AMC 12A #16](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12A_Problems).
## Problem
The numbers 1,2,$\dots,9$ are randomly placed into the 9 squares of a 3 $\times 3$ grid. Each square gets one number, and each of the numbers is used once. What is the probability that the sum of the numbers in each row and each column is odd?

$\textbf{(A) }\frac{1}{21}\qquad\textbf{(B) }\frac{1}{14}\qquad\textbf{(C) }\frac{5}{63}\qquad\textbf{(D) }\frac{2}{21}\qquad\textbf{(E) }\frac{1}{7}$
## Solutions
### Solution 1
Note that odd sums can only be formed by (e,e,o) or (o,o,o), so we focus on placing the evens: we need to have each even be with another even in each row/column. Because there are only 5 odd numbers overall, we can only have 1 (o,o,o) row and 1 (o,o,o) column. It can be seen that there are 3 $\cdot 3 = 9$ ways to do this. There  are then 5! ways to permute the odd numbers, and 4! ways to permute the even numbers, thus giving the answer as $\frac{9 \cdot 5! \cdot 4!}{9!}=\boxed{\textbf{(B) }\frac{1}{14}}.$

*~Petallstorm*
(Minor edits by JeffersonJ and monkey_land)
### Solution 2 (Pigeonhole)
By the [https://artofproblemsolving.com/wiki/index.php/Pigeonhole_Principle Pigeonhole Principle], there must be at least one row with 2 or more odd numbers in it. Therefore, that row must contain 3 odd numbers in order to have an odd sum. The same thing can be done with the columns. Thus we simply have to choose one row and one column to be filled with odd numbers, so the number of valid odd/even configurations (without regard to which particular odd and even  numbers are placed where) is 3 $\cdot 3 = 9.$ The denominator will be $\binom{9}{4},$ the total number of ways we could choose which 4 of the 9 squares will contain an even number. Hence the answer is $\frac{9}{\binom{9}{4}}=\boxed{\textbf{(B) }\frac{1}{14}}$

- The Pigeonhole Principle isn't really necessary here: After noting from the first solution that any row that contains evens must contain two evens, the result follows that the four evens must form the corners of a rectangle.

*~Petallstorm*
### Solution 3
Note that there are 5 odds and 4 evens, and for three numbers to sum an odd number, either 1 or three must be odd. Hence, one column must be all odd and one row must be all odd. First, we choose a row, for which there are three choices and within the row P(5,3). There are 3! ways to order the remaining odds and 4! ways to order the evens. The total possible ways is 9!. $\frac{3 \cdot P(5,3) \cdot 3! \cdot 4!}{9!}=\boxed{\textbf{(B) }\frac{1}{14}}$

*~Petallstorm*
### Solution 4
Note that the odd sums are only formed by, (O, O, O) or any permutation of (O, E, E). When looking at a 3x3 box, we realize that there must always be one column that is odd and one row that is odd. Calculating the probability of one permutation of this we get:
{| class="wikitable" style="margin:auto; color:black; background-color:#ffffff;"
|-style="vertical-align:middle;"
| style="height:100px; width:100px; text-align:center;" |Odd - $\frac{5}{9}$||Odd - $\frac{4}{8}$||Odd - $\frac{3}{7}$
|-style="vertical-align:middle;"
| style="height:100px; width:100px; text-align:center;" |Odd - $\frac{2}{6}$ ||  Even   ||  Even
|-style="vertical-align:middle;"
| style="height:100px; width:100px; text-align:center;" |Odd - $\frac{1}{5}$ ||  Even   ||  Even
|}

$$\frac{5!}{P(9,5)} = \frac{5 \cdot 4\cdot 3 \cdot 2 \cdot 1}{9 \cdot 8\cdot 7 \cdot 6 \cdot 5} = \frac{1}{126}$$


Now, there are 9 ways you can get this particular permutation (3 choices for all odd row, 3 choices for all odd column), so multiplying the result by 9, we get:

$$\frac{1}{126} \cdot 9 = \frac{9}{126} = \boxed{\textbf{(B) }\frac{1}{14}}$$

We could also calculate the probability of all the even numbers being grouped, which can only happen in 4 ways. This is similar to the solution above but requires less work. Solving you would get 1/56 for the 4 even numbers to be grouped together, but you must multiplfy by 4 to account for the 4 corners. Solving, your answer is 1/14
*~petallstorm*
~(minor edits by Bobnotbob)
### Solution 5
To get an odd sum we need $\text{odd} + \text{odd} + \text{odd}$ or we need $\text{odd} + \text{even} + \text{even}.$ Note that there are 9! ways to arrange the numbers. Also notice that there are 4 even numbers and 5 odd numbers from 1 through 9.

The number of ways to arrange the even numbers is 4! and the number of ways to arrange the odd numbers is 5!. Now a common strategy is to deal with the category with fewer numbers so this suggests for us to look at even numbers and try something out.

Since we have 4 even numbers we need to split two evens to one row and two evens to another row. Note that there are $\tbinom{3}{2}$ ways to choose the rows, and the $\tbinom{3}{2}$ to choose where the two even numbers go in that row. The odd numbers go wherever there is a spot left which means we don't need to care about them. So we totally have 9 ways to place the even numbers.

Don't forget, we still need to arrange these even and odd numbers and like mentioned above there are 4! and 5! ways respectively.

Therefore our answer is simply $\frac{5! \cdot 4! \cdot 9}{9!} = \frac{1}{7\cdot 2} = \boxed{\frac{1}{14}}.$
### Solution 6
We need to know the number of successful outcomes/Total outcomes. We start by the total number of ways to place the odd numbers, which is $\binom{9}{5},$ which is because there are 5 odd number between 1 and 9. Note we need 1 odd number and 2 even numbers OR 3 odd numbers in each row to satisfy our conditions. We have 3 types of arrangements for the number of successful outcomes, we could have all the even numbers on the corners, which is 1 case, We could have the odd numbers arranged like a T, which has 4 cases (you could twist them around), and you have the even numbers in a 2 by 2 square, and you have 4 cases for that. We have 9 successful cases and 126 total cases, so the probability is $\frac{9}{126} = \frac{1}{14}$ which is $\boxed{\textbf{(B) }\frac{1}{14}}$

*~Arcticturn*
### Solution 7
Since we only care about the parity of the sum of our rows and columns, let's take everything modulo 2. We can see that there will be 5 odd numbers, and 4 even numbers. Testing a few configurations, we realize that if we have one complete row and column of 1 $\text{s},$ the sum of all rows and columns will be odd. We find 3 distinct configurations:

$$
\begin{tabular}{ |c|c|c| } \hline 1 & 1 & 1 \\ \hline 1 & 0 & 0 \\ \hline 1 & 0 & 0 \\ \hline \end{tabular} \ \ \ \ \begin{tabular}{ |c|c|c| } \hline 1 & 0 & 0 \\ \hline 1 & 1 & 1 \\ \hline 1 & 0 & 0 \\ \hline \end{tabular} \ \ \ \ \begin{tabular}{ |c|c|c| } \hline 0 & 1 & 0 \\ \hline 1 & 1 & 1 \\ \hline 0 & 1 & 0 \\ \hline \end{tabular}
$$

We can see that rotating the first configuration by $90^{\circ}$, $180^{\circ}$, $270^{\circ}$, and $360^{\circ}$, will give us 4 cases for this configuration. Similarly, the second configuration has 4 cases by the same rotations. The third configuration only has 1 case because its rotational symmetry is $90^{\circ}$. There are 5! $\cdot 4$! ways to choose the odd and even numbers for all of the configurations, so our answer is $\frac{(4+4+1)(5!\cdot 4!)}{9!}=\boxed{\textbf{(B) }\frac{1}{14}}.$

$\textbf{Note:}$ We can also realize that there are 9 places for the row and column of 1 $\text{s}$ to overlap, resulting in 9 cases for all of the possible configurations.

*~kn07*
## Video Solutions
### Video Solution (Interactive teaching approach!)
https://www.youtube.com/watch?v=IwcVLOjZFLg

*~Mathkidsbymax*
### Video Solution by OmegaLearn
https://youtu.be/IRyWOZQMTV8?t=2069

*~pi_is_3.14*
### Video Solution 1
https://youtu.be/meWXF5pPdlI

Education, the Study of Everything
### Video Solution 2
https://www.youtube.com/watch?v=uJgS-q3-1JE
### Video Solution 3
https://www.youtube.com/watch?v=3Sj7XPernCY
### Video Solution 4
https://www.youtube.com/watch?v=APKGHtj-2rI
## See Also
