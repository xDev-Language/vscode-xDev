const vscode = require( 'vscode' );

const rtl = new Map( require( './data/functions.json' ).map( f => [ f.name.toUpperCase(), f ] ) );

function funcs()
{
   const all = new Map( rtl );
   const re = /^[ \t]*(?:(?:static|init|exit)[ \t]+)?(?:function|procedure)[ \t]+(\w+)[ \t]*\(?([\w \t,]*)/gim;

   for( const doc of vscode.workspace.textDocuments )
   {
      if( doc.languageId !== 'xdev' )
         continue;

      for( const m of doc.getText().matchAll( re ) )
      {
         const params = [ ...m[2].matchAll( /\w+/g ) ].map( p => p[0] );

         all.set( m[1].toUpperCase(), {
            name: m[1],
            sig: `${ m[1] }( ${ params.join( ', ' ) } )`,
            doc: `${ vscode.workspace.asRelativePath( doc.uri ) }:${ doc.positionAt( m.index ).line + 1 }`,
            params
         } );
      }
   }
   return all;
}

function signature( f, active )
{
   const info = new vscode.SignatureInformation( f.sig, f.doc );
   const help = new vscode.SignatureHelp();
   let at = f.sig.indexOf( '(' );

   info.parameters = f.params.map( p =>
   {
      const start = f.sig.indexOf( p, at );
      at = start + p.length;
      return new vscode.ParameterInformation( [ start, at ] );
   } );
   help.signatures = [ info ];
   help.activeSignature = 0;
   help.activeParameter = active;
   return help;
}

function activate( context )
{
   context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider( 'xdev', {
         provideCompletionItems( doc, pos )
         {
            const text = doc.lineAt( pos ).text.slice( 0, pos.character );

            if( /^\s*#/.test( text ) || /:\w*$/.test( text ) )
               return;

            return [ ...funcs().values() ].map( f =>
            {
               const item = new vscode.CompletionItem( f.name, vscode.CompletionItemKind.Function );

               item.detail = f.sig;
               item.documentation = f.doc;
               item.insertText = new vscode.SnippetString( f.params.length ? `${ f.name }( $0 )` : `${ f.name }()` );
               item.command = { command: 'editor.action.triggerParameterHints', title: '' };
               return item;
            } );
         }
      } ),

      vscode.languages.registerSignatureHelpProvider( 'xdev', {
         provideSignatureHelp( doc, pos )
         {
            const all = funcs();
            const stack = [];
            const text = doc.lineAt( pos ).text.slice( 0, pos.character );

            for( const [ t, name ] of text.matchAll( /"[^"]*"?|'[^']*'?|(\w+)\s*\(|[([{]|[)\]}]|,/g ) )
            {
               if( t === ',' )
               {
                  if( stack.length )
                     stack.at( -1 ).param++;
               }
               else if( ')]}'.includes( t ) )
                  stack.pop();
               else if( !'"\''.includes( t[0] ) )
                  stack.push( { name, param: 0 } );
            }

            const call = stack.findLast( c => c.name && all.has( c.name.toUpperCase() ) );

            if( call )
               return signature( all.get( call.name.toUpperCase() ), call.param );
         }
      }, '(', ',' ),

      vscode.languages.registerHoverProvider( 'xdev', {
         provideHover( doc, pos )
         {
            const range = doc.getWordRangeAtPosition( pos, /(?<!:)\b\w+(?=\s*\()/ );
            const f = range && funcs().get( doc.getText( range ).toUpperCase() );

            if( f )
               return new vscode.Hover( [ new vscode.MarkdownString().appendCodeblock( f.sig, 'xdev' ), f.doc ], range );
         }
      } )
   );
}

module.exports = { activate };
